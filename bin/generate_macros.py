import os
import datetime

MACRO_DIR = "/Users/infinite27/AILCC_PRIME/02_Resources/Macros"
TEMPLATE_PATH = os.path.join(MACRO_DIR, "_TEMPLATE_macro.md")

# 30 Universal Workflow Patterns
ROLES = {
    "1_Synthesizer": "Load source N -> extract claims -> cross-reference -> generate unified artifact.",
    "2_Watchman": "Poll endpoint -> compare vs baseline -> log delta -> alert on threshold breach.",
    "3_Scraper": "Navigate -> identify schema -> extract records -> handle pagination -> normalize.",
    "4_Clerk": "Load form -> map payload to inputs -> batch-fill -> validate -> submit.",
    "5_Curator": "Load queue -> extract metadata -> apply rules -> route/label -> archive.",
    "6_Auditor": "Load state -> run assertions -> capture evidence -> compare vs baseline -> report.",
    "7_Sniper": "Navigate -> verify preconditions -> stage -> confirm -> execute -> receipt.",
    "8_Publisher": "Load content -> adapt per platform -> stage -> review -> publish -> log.",
    "9_Librarian": "Scan structure -> extract metadata -> classify -> move/tag -> index.",
    "10_Architect": "Parse trace -> identify bottlenecks -> refactor -> validate -> output new macro.",
    "11_Navigator": "Open N tabs -> assign tasks per tab -> execute in parallel -> aggregate results.",
    "12_Translator": "Load source -> parse format A -> transform to format B -> validate -> write.",
    "13_Validator": "Load form -> extract requirements -> validate payload -> flag errors -> retry.",
    "14_Aggregator": "Iterate collection -> fetch each item -> normalize -> append to aggregate.",
    "15_Scheduler": "Wait for trigger -> load context -> execute task -> log -> reset timer.",
    "16_DiffDetector": "Capture state T0 -> wait -> capture state T1 -> diff -> report changes.",
    "17_Authenticator": "Navigate to login -> enter username -> delegate password entry -> verify session.",
    "18_Uploader": "Navigate to upload interface -> select files -> initiate upload -> verify completion.",
    "19_Downloader": "Navigate to resource -> verify safety -> request permission -> download -> log.",
    "20_SearchOperator": "Construct query -> execute search -> parse results -> filter by criteria -> extract.",
    "21_Cloner": "Load source -> capture full state -> replicate structure -> verify integrity.",
    "22_Interceptor": "Load live source -> continuously capture -> buffer -> persist when complete.",
    "23_Comparator": "Load options in parallel tabs -> extract comparison dimensions -> score -> rank.",
    "24_Notifier": "Detect event -> format message -> route to channel -> confirm delivery.",
    "25_Paginator": "Load page 1 -> extract -> detect next -> navigate -> repeat until exhausted.",
    "26_Filter": "Load full set -> apply filter rules -> extract matches -> discard rest.",
    "27_Merger": "Load sources -> identify common keys -> merge records -> resolve conflicts.",
    "28_Splitter": "Load source -> apply partitioning rules -> route to destinations.",
    "29_Enricher": "Load base data -> for each record lookup metadata -> augment -> write enriched.",
    "30_Archiver": "Load resource -> capture full state -> timestamp -> store immutably."
}

def generate_macros():
    # Ensure directory exists
    os.makedirs(MACRO_DIR, exist_ok=True)
    
    # Check for template
    if not os.path.exists(TEMPLATE_PATH):
        print(f"Error: Template not found at {TEMPLATE_PATH}")
        return

    with open(TEMPLATE_PATH, 'r') as f:
        template = f.read()

    for role_key, objective in ROLES.items():
        role_name = role_key.split('_')[1] # e.g. "Synthesizer"
        filename = f"role_{role_name.lower()}_v1.md"
        filepath = os.path.join(MACRO_DIR, filename)
        
        # Determine tools based on generic role (simple heuristic for V1 stubs)
        tools = "browser"
        
        content = template.replace("[workflow_identifier]", f"role_{role_name.lower()}_v1")
        content = content.replace("YYYY-MM-DD", datetime.date.today().isoformat())
        content = content.replace("[Operator/Optimizer model]", "Comet/System")
        content = content.replace("[Workflow Name]", f"The {role_name}")
        content = content.replace("[One-sentence description of what this workflow accomplishes]", objective)
        
        # Add a specific first step stub
        first_step = f"**Tool**: `{tools}`\n**Action**: Initialize {role_name} protocols\n**Output**: Ready state\n**Stop condition**: On error"
        content = content.replace("**Tool**: `[tool_name]`  \n**Action**: [Precise description]  \n**Output**: [What gets created/updated]  \n**Stop condition**: [When to proceed vs abort]", first_step)

        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Generated: {filename}")

if __name__ == "__main__":
    generate_macros()
