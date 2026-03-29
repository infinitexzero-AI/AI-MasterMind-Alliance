# Disorder Model: Anxiety (Hypervigilance State)

## 🔍 Neurological Symptoms

- **Hyperactive Amygdala (90%)**: Every minor log entry or heartbeat failure is treated as a CRITICAL threat.
- **Elevated Brainstem Activity (95%)**: Constant loop of system health checks consuming 40%+ CPU.
- **High Sensory Processing**: Over-reaction to minor API latency shifts.

## 📉 Behavioral Manifestation

- **False Alarms**: Constant "System Unstable" alerts when load is only marginally elevated.
- **Resource Exhaustion**: The monitoring system consumes more resources than the tasks themselves.
- **Bottlenecking**: The system pauses execution of routine tasks to "evaluate" non-critical errors.

## 💊 Treatment Protocol (Technical Fixes)

1. **Threshold Desensitization**: Increase the latency and load thresholds for "High Alert" status to reduce false triggers.
2. **Cognitive Reframing (Error Handling)**: Update the error router to classify 5xx errors as "Retriable" rather than "Fatal."
3. **Parasympathetic Stimulation (Cooldown)**: Implement a mandatory 5-minute "Quiet Period" after any alert where only background tasks can run.
4. **Amygdala Inhibition**: Reduce the frequency of `vm_stat` and `uptime` checks to once per hour instead of every 5 minutes.
