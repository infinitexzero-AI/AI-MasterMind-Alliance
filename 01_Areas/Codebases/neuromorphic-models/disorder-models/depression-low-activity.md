# Disorder Model: Depression (Low Motivation State)

## 🔍 Neurological Symptoms

- **Low Motor Cortex Activity (20%)**: Minimal action execution; tasks stay in the queue but aren't processed.
- **Low Prefrontal Activity (30%)**: Lack of strategic planning; the system only responds to direct USER prompts.
- **Reduced Amygdala Sensitivity (20%)**: Lack of urgency; high-priority signals don't trigger immediate response.
- **Dopaminergic Deficiency**: Reward pathways for task completion are offline.

## 📉 Behavioral Manifestation

- **Proactive Failure**: Agents do not offer follow-up suggestions or autonomous research.
- **Latency Spikes**: Responses take significantly longer than the 45ms target.
- **Queue Stagnation**: Backlog of "Low Priority" tasks grows indefinitely without being touched.

## 💊 Treatment Protocol (Technical Fixes)

1. **Dopamine Boost (Incentive Signals)**: Implement a "Succesful Task Completion" log that triggers a context refresh and proactive research search.
2. **Behavioral Activation**: Use a cron-managed "Wake Up Pulse" to force-trigger task reviews every 15 minutes.
3. **Amygdala Recalibration**: Temporarily lower the threshold for "Urgent" tasks to force system engagement.
4. **Motor Cortex Stimulation**: Increase the `maxConcurrentTasks` limit in the Valentine Core to force processing.
