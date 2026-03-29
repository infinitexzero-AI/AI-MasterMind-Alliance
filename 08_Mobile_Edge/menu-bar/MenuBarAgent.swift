import Cocoa
import Foundation

// ── Config ────────────────────────────────────────────────────────────────────
let DASHBOARD_URL  = "http://localhost:3000"
let AIRGAP_FILE    = FileManager.default.currentDirectoryPath + "/.air-gap.json"
let POLL_INTERVAL: TimeInterval = 5.0
let THOUGHT_POLL:  TimeInterval = 8.0

// ── Thought model ─────────────────────────────────────────────────────────────
struct SwarmThought {
    let agent: String
    let thought: String
    let type: String        // "insight" | "warning" | "plan" | "observation"
    let timestamp: String
}

// ── Air-Gap helper ────────────────────────────────────────────────────────────
func readAirGapState() -> Bool {
    guard let data = FileManager.default.contents(atPath: AIRGAP_FILE),
          let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
    else { return false }
    return json["active"] as? Bool == true
}

func writeAirGapState(active: Bool) {
    let json: [String: Any] = ["active": active, "activatedAt": ISO8601DateFormatter().string(from: Date()), "activatedBy": "MenuBar"]
    guard let data = try? JSONSerialization.data(withJSONObject: json, options: .prettyPrinted) else { return }
    try? data.write(to: URL(fileURLWithPath: AIRGAP_FILE))
}

// ── emitThought helper ────────────────────────────────────────────────────────
func emitThought(_ thought: String, type: String = "observation") {
    guard let url = URL(string: "\(DASHBOARD_URL)/api/singularity/thought-stream") else { return }
    var req = URLRequest(url: url)
    req.httpMethod = "POST"
    req.setValue("application/json", forHTTPHeaderField: "Content-Type")
    let body: [String: Any] = ["agentId": "AGT-HERALD-MENUBAR", "agentName": "HERALD", "thought": thought, "type": type, "confidence": 0.9]
    req.httpBody = try? JSONSerialization.data(withJSONObject: body)
    req.timeoutInterval = 3
    URLSession.shared.dataTask(with: req).resume()
}

// ── App Delegate ──────────────────────────────────────────────────────────────
class AppDelegate: NSObject, NSApplicationDelegate {
    var statusItem: NSStatusItem?
    var timer: Timer?
    var thoughtTimer: Timer?
    var popover: NSPopover?
    var popoverVC: PopoverViewController?
    var airGapActive = false
    var lastAgentCount = 0

    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.accessory)
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) { [weak self] in
            self?.setup()
        }
    }

    // ── Setup ─────────────────────────────────────────────────────────────────
    func setup() {
        airGapActive = readAirGapState()

        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        guard let button = statusItem?.button else {
            print("[AILCC] ⚠️ StatusItem button unavailable")
            return
        }
        button.title = "⚫ AILCC"
        button.font = NSFont.monospacedSystemFont(ofSize: 12, weight: .medium)
        button.action = #selector(handleClick)   // no-param selector
        button.sendAction(on: [.leftMouseUp, .rightMouseUp])
        button.target = self
        // statusItem?.menu is intentionally NEVER set — avoids run-loop block

        // Popover
        let vc = PopoverViewController()
        popoverVC = vc
        let pop = NSPopover()
        pop.contentViewController = vc
        pop.behavior = .transient
        pop.contentSize = NSSize(width: 360, height: 460)
        popover = pop

        // Start polling
        poll()
        pollThoughts()
        timer = Timer.scheduledTimer(withTimeInterval: POLL_INTERVAL, repeats: true) { [weak self] _ in self?.poll() }
        thoughtTimer = Timer.scheduledTimer(withTimeInterval: THOUGHT_POLL, repeats: true) { [weak self] _ in self?.pollThoughts() }

        emitThought("Menu Bar agent launched — Herald online, polling \(DASHBOARD_URL)", type: "insight")
    }

    // ── Context menu (right-click only — never assigned to statusItem.menu) ──
    func makeContextMenu() -> NSMenu {
        let menu = NSMenu()
        let items: [(String, Selector)] = [
            ("🌌 Dashboard",       #selector(openDashboard)),
            ("📊 Observability",   #selector(openObservability)),
            ("⚔️  War Room",        #selector(openWarRoom)),
        ]
        items.forEach { title, sel in
            let item = NSMenuItem(title: title, action: sel, keyEquivalent: "")
            item.target = self; menu.addItem(item)
        }
        menu.addItem(NSMenuItem.separator())
        let agLabel = airGapActive
            ? "🛡️ Air-Gap: ON  — Deactivate"
            : "🔓 Air-Gap: OFF — Activate"
        let agItem = NSMenuItem(title: agLabel, action: #selector(toggleAirGap), keyEquivalent: "")
        agItem.target = self; menu.addItem(agItem)
        menu.addItem(NSMenuItem.separator())
        let quit = NSMenuItem(title: "Quit AILCC Cortex", action: #selector(quit), keyEquivalent: "q")
        quit.target = self; menu.addItem(quit)
        return menu
    }

    // ── Poll dashboard health ─────────────────────────────────────────────────
    func poll() {
        guard let url = URL(string: "\(DASHBOARD_URL)/api/system/health") else { return }
        URLSession.shared.dataTask(with: url) { [weak self] data, _, error in
            DispatchQueue.main.async {
                if error != nil {
                    self?.updateStatus(status: "offline", cpu: nil, memory: nil, agents: [])
                    return
                }
                guard let data = data,
                      let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
                else {
                    self?.updateStatus(status: "offline", cpu: nil, memory: nil, agents: [])
                    return
                }
                let status  = json["status"]  as? String ?? "unknown"
                let cpu     = json["cpu"]     as? Double
                let memory  = json["memory"]  as? Double
                let agents  = json["agents"]  as? [[String: Any]] ?? []
                self?.updateStatus(status: status, cpu: cpu, memory: memory, agents: agents)
            }
        }.resume()
    }

    // ── Poll thought stream ───────────────────────────────────────────────────
    func pollThoughts() {
        guard let url = URL(string: "\(DASHBOARD_URL)/api/singularity/thought-stream?limit=3") else { return }
        URLSession.shared.dataTask(with: url) { [weak self] data, _, _ in
            guard let data = data,
                  let arr = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]]
            else { return }
            let thoughts = arr.prefix(3).map { d -> SwarmThought in
                SwarmThought(
                    agent:   d["agentName"]  as? String ?? "AGENT",
                    thought: d["thought"]    as? String ?? "",
                    type:    d["type"]       as? String ?? "observation",
                    timestamp: d["timestamp"] as? String ?? ""
                )
            }
            DispatchQueue.main.async {
                self?.popoverVC?.updateThoughts(Array(thoughts))
            }
        }.resume()
    }

    // ── Update tray title + popover ───────────────────────────────────────────
    func updateStatus(status: String, cpu: Double?, memory: Double?, agents: [[String: Any]]) {
        let agCount  = agents.count
        let airGap   = readAirGapState()
        airGapActive = airGap

        // Tray title: icon · AILCC · CPU · agent count
        let icon: String
        if airGap           { icon = "🛡️" }
        else if status == "healthy" { icon = "⚡" }
        else if status == "warning" { icon = "⚠️" }
        else if status == "error"   { icon = "🔴" }
        else                { icon = "⚫" }

        var title = "\(icon) AILCC"
        if let c = cpu    { title += " · \(Int(c))%" }
        if agCount > 0    { title += " · \(agCount)🤖" }
        if airGap         { title += " [AIR-GAP]" }

        statusItem?.button?.title = title
        statusItem?.button?.toolTip = "AI Mastermind Alliance\nStatus: \(status.uppercased())\nCPU: \(cpu.map{"\(Int($0))%"} ?? "—")  Mem: \(memory.map{"\(Int($0))%"} ?? "—")\nAgents: \(agCount)\nAir-Gap: \(airGap ? "ACTIVE" : "off")"

        // Emit thought on significant changes
        if agCount != lastAgentCount {
            emitThought("Menu Bar state updated — \(agCount) agents online, status: \(status)", type: "observation")
            lastAgentCount = agCount
        }
        if airGap != (lastAgentCount < 0) {  // track air-gap flip separately via key
            // only emit on toggle, handled in toggleAirGap()
        }

        popoverVC?.updateStatus(status: status, cpu: cpu, memory: memory, agents: agents, airGap: airGap)
    }

    // ── Unified click handler — no-param, reads event type internally ───────
    @objc func handleClick() {
        guard let event = NSApp.currentEvent,
              let button = statusItem?.button else { return }
        if event.type == .rightMouseUp {
            let menu = makeContextMenu()
            menu.popUp(positioning: nil,
                       at: NSPoint(x: 0, y: button.bounds.height + 4),
                       in: button)
        } else {
            guard let pop = popover else { return }
            if pop.isShown {
                pop.performClose(nil)
            } else {
                pop.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
                NSApp.activate(ignoringOtherApps: true)
            }
        }
    }

    // ── Air-Gap toggle ────────────────────────────────────────────────────────
    @objc func toggleAirGap() {
        let newState = !airGapActive
        writeAirGapState(active: newState)
        airGapActive = newState
        // No menu rebuild needed — menu is constructed fresh each right-click
        let msg = newState
            ? "Air-Gap ACTIVATED from Menu Bar — all external agent dispatch blocked"
            : "Air-Gap DEACTIVATED from Menu Bar — external dispatch restored"
        emitThought(msg, type: newState ? "warning" : "insight")
        poll()  // refresh tray immediately
    }

    // ── Navigation ────────────────────────────────────────────────────────────
    @objc func openDashboard()     { NSWorkspace.shared.open(URL(string: DASHBOARD_URL)!) }
    @objc func openObservability() { NSWorkspace.shared.open(URL(string: "\(DASHBOARD_URL)/observability")!) }
    @objc func openWarRoom()       { NSWorkspace.shared.open(URL(string: "\(DASHBOARD_URL)/war-room")!) }
    @objc func quit() {
        try? FileManager.default.removeItem(atPath: "/tmp/ailcc-menubar.pid")
        emitThought("Menu Bar agent shutting down", type: "observation")
        NSApp.terminate(nil)
    }
}

// ── Popover View Controller ───────────────────────────────────────────────────
class PopoverViewController: NSViewController {

    // All view refs are optional — safe before loadView() fires
    var statusDot:    NSTextField?
    var cpuLabel:     NSTextField?
    var memLabel:     NSTextField?
    var agentSection: NSTextField?
    var agentsStack:  NSStackView?
    var thoughtStack: NSStackView?
    var airGapBadge:  NSTextField?

    override func loadView() {
        let v = NSView(frame: NSRect(x: 0, y: 0, width: 360, height: 460))
        v.wantsLayer = true
        v.layer?.backgroundColor = NSColor(red: 0.04, green: 0.06, blue: 0.13, alpha: 0.97).cgColor
        view = v

        var y: CGFloat = 420

        // ── Header ─────────────────────────────────────────────────────────
        let header = label("AI MASTERMIND ALLIANCE", font: cinzel(11), color: NSColor(red: 0.6, green: 0.4, blue: 1, alpha: 1))
        header.frame = NSRect(x: 16, y: y, width: 328, height: 20); y -= 18
        v.addSubview(header)

        let sub = label("HERALD CORTEX MONITOR", font: mono(8), color: gray(0.35))
        sub.frame = NSRect(x: 16, y: y, width: 328, height: 14); y -= 20
        v.addSubview(sub)

        divider(y: y, v: v); y -= 16

        // ── Status row ─────────────────────────────────────────────────────
        let sd = label("● STATUS: STARTING", font: mono(13, weight: .semibold), color: .white)
        sd.frame = NSRect(x: 16, y: y, width: 200, height: 22); y -= 4
        statusDot = sd; v.addSubview(sd)

        let ag = label("", font: mono(9), color: NSColor(red: 1, green: 0.3, blue: 0.3, alpha: 0))
        ag.frame = NSRect(x: 220, y: y + 4, width: 130, height: 18)
        airGapBadge = ag; v.addSubview(ag)
        y -= 22

        // ── Metrics row ────────────────────────────────────────────────────
        let cl = label("CPU: —", font: mono(11), color: gray(0.55))
        cl.frame = NSRect(x: 16, y: y, width: 100, height: 18)
        cpuLabel = cl; v.addSubview(cl)

        let ml = label("MEM: —", font: mono(11), color: gray(0.55))
        ml.frame = NSRect(x: 120, y: y, width: 100, height: 18)
        memLabel = ml; v.addSubview(ml)
        y -= 28

        divider(y: y, v: v); y -= 16

        // ── Thought Stream section ──────────────────────────────────────────
        let th = label("⚡ SWARM THOUGHT STREAM", font: mono(9, weight: .bold), color: NSColor(red: 0.6, green: 0.4, blue: 1, alpha: 0.7))
        th.frame = NSRect(x: 16, y: y, width: 328, height: 14); y -= 16
        v.addSubview(th)

        let ts = NSStackView()
        ts.orientation = .vertical
        ts.spacing = 4
        ts.alignment = .leading
        let tsH: CGFloat = 90
        ts.frame = NSRect(x: 16, y: y - tsH, width: 328, height: tsH)
        thoughtStack = ts; v.addSubview(ts)
        y -= (tsH + 16)

        divider(y: y, v: v); y -= 16

        // ── Agents section ─────────────────────────────────────────────────
        let ah = label("🤖 SWARM AGENTS", font: mono(9, weight: .bold), color: NSColor(red: 0.6, green: 0.4, blue: 1, alpha: 0.7))
        ah.frame = NSRect(x: 16, y: y, width: 328, height: 14); y -= 16
        agentSection = ah; v.addSubview(ah)

        let ast = NSStackView()
        ast.orientation = .vertical
        ast.spacing = 3
        ast.alignment = .leading
        let astH: CGFloat = 100
        ast.frame = NSRect(x: 16, y: y - astH, width: 328, height: astH)
        agentsStack = ast; v.addSubview(ast)
        y -= (astH + 12)

        // ── Footer buttons ─────────────────────────────────────────────────
        let dash = btnFooter("🌌 Dashboard",     x: 16,  y: 12, w: 110)
        dash.action = #selector(openDash); v.addSubview(dash)

        let obs = btnFooter("📊 Observability", x: 130, y: 12, w: 120)
        obs.action = #selector(openObs); v.addSubview(obs)

        let war = btnFooter("⚔️ War Room",       x: 254, y: 12, w: 90)
        war.action = #selector(openWar); v.addSubview(war)
    }

    // ── Update methods ────────────────────────────────────────────────────────
    func updateStatus(status: String, cpu: Double?, memory: Double?, agents: [[String: Any]], airGap: Bool) {
        let dot:   String
        let color: NSColor
        switch status {
        case "healthy": dot = "●"; color = NSColor(red: 0.2, green: 0.9, blue: 0.4, alpha: 1)
        case "warning": dot = "◐"; color = NSColor(red: 1.0, green: 0.7, blue: 0.1, alpha: 1)
        case "offline": dot = "○"; color = gray(0.4)
        default:        dot = "●"; color = NSColor(red: 0.9, green: 0.2, blue: 0.2, alpha: 1)
        }
        statusDot?.stringValue = "\(dot) STATUS: \(status.uppercased())"
        statusDot?.textColor = color

        cpuLabel?.stringValue = "CPU: \(cpu.map { "\(Int($0))%" } ?? "—")"
        cpuLabel?.textColor   = cpu.map { $0 > 80 ? NSColor(red: 1, green: 0.3, blue: 0.2, alpha: 1) : gray(0.55) } ?? gray(0.35)

        memLabel?.stringValue = "MEM: \(memory.map { "\(Int($0))%" } ?? "—")"

        // Air-Gap badge
        if airGap {
            airGapBadge?.stringValue = "🛡️ AIR-GAP ON"
            airGapBadge?.textColor   = NSColor(red: 0.2, green: 0.9, blue: 0.4, alpha: 1)
        } else {
            airGapBadge?.stringValue = ""
        }

        // Agents
        guard let stack = agentsStack else { return }
        stack.arrangedSubviews.forEach { stack.removeArrangedSubview($0); $0.removeFromSuperview() }

        let list = agents.isEmpty
            ? [["name": "FORGE"], ["name": "SCOUT"], ["name": "CORTEX"], ["name": "GUARDIAN"], ["name": "NEXUS"]]
            : Array(agents.prefix(5))

        for a in list {
            let name   = a["name"]   as? String ?? "AGENT"
            let state  = a["status"] as? String ?? "active"
            let isOn   = state == "active"
            let row    = label("\(isOn ? "●" : "○") \(name.padding(toLength: 12, withPad: " ", startingAt: 0))  \(state.uppercased())",
                               font: mono(10), color: isOn ? NSColor(red: 0.2, green: 0.9, blue: 0.4, alpha: 1) : gray(0.4))
            stack.addArrangedSubview(row)
        }
    }

    func updateThoughts(_ thoughts: [SwarmThought]) {
        guard let stack = thoughtStack else { return }
        stack.arrangedSubviews.forEach { stack.removeArrangedSubview($0); $0.removeFromSuperview() }

        if thoughts.isEmpty {
            let empty = label("  No thoughts yet — start dashboard to see stream", font: mono(9), color: gray(0.3))
            stack.addArrangedSubview(empty)
            return
        }

        for t in thoughts {
            let typeIcon = ["insight": "💡", "warning": "⚠️", "plan": "📋", "observation": "👁️"][t.type] ?? "💬"
            let typeColor: NSColor = t.type == "warning"
                ? NSColor(red: 1, green: 0.7, blue: 0.1, alpha: 1)
                : NSColor(red: 0.6, green: 0.4, blue: 1, alpha: 0.9)
            let short = String(t.thought.prefix(55)) + (t.thought.count > 55 ? "…" : "")
            let row = label("\(typeIcon) [\(t.agent)] \(short)", font: mono(9), color: typeColor)
            row.lineBreakMode = .byTruncatingTail
            stack.addArrangedSubview(row)
        }
    }

    // ── Factory helpers ───────────────────────────────────────────────────────
    func label(_ string: String, font: NSFont, color: NSColor) -> NSTextField {
        let f = NSTextField(labelWithString: string)
        f.font = font; f.textColor = color
        f.lineBreakMode = .byTruncatingTail
        f.translatesAutoresizingMaskIntoConstraints = true
        return f
    }

    func divider(y: CGFloat, v: NSView) {
        let d = NSBox(frame: NSRect(x: 16, y: y, width: 328, height: 1))
        d.boxType = .separator; v.addSubview(d)
    }

    func btnFooter(_ title: String, x: CGFloat, y: CGFloat, w: CGFloat) -> NSButton {
        let b = NSButton(frame: NSRect(x: x, y: y, width: w, height: 28))
        b.title = title; b.bezelStyle = .rounded
        b.font = mono(9, weight: .medium); b.target = self; return b
    }

    func mono(_ size: CGFloat, weight: NSFont.Weight = .regular) -> NSFont {
        return NSFont.monospacedSystemFont(ofSize: size, weight: weight)
    }

    func cinzel(_ size: CGFloat) -> NSFont {
        return NSFont(name: "Cinzel", size: size) ?? NSFont.boldSystemFont(ofSize: size)
    }

    func gray(_ alpha: CGFloat) -> NSColor { NSColor(white: alpha, alpha: 1) }

    @objc func openDash() { NSWorkspace.shared.open(URL(string: DASHBOARD_URL)!) }
    @objc func openObs()  { NSWorkspace.shared.open(URL(string: "\(DASHBOARD_URL)/observability")!) }
    @objc func openWar()  { NSWorkspace.shared.open(URL(string: "\(DASHBOARD_URL)/war-room")!) }
}

// ── Entry Point ───────────────────────────────────────────────────────────────
let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
