# LinkedIn Post — Week 03: CivicProof

During peak monsoon in Indian metros, municipal helpline portals receive thousands of citizen complaints every single morning.

The biggest operational bottleneck isn't citizen inaction — it's **redundant dispatches**.
When 20 commuters report the exact same crater pothole or uncovered manhole on 100ft Road, municipal crews get assigned 20 separate work orders. Meanwhile, fresh life-threatening hazards across the city languish in a bureaucratic backlog.

For Week 3 of my #10WeekAIBuilderChallenge, I built **CivicProof** 🏛️:
An AI civic grievance triage and deduplication engine built specifically for municipal corporations (PMC, BBMP, BMC).

Here is what CivicProof does:
1. **Zero-Latency Domain Classification:** Classifies raw citizen vernacular into 6 core engineering domains (Roads, Sanitation, Electrical, Jal Board, Drainage, Horticulture) in <15ms.
2. **Life-Safety Priority Escalation:** Automatically escalates uncovered drainage manholes to `CRITICAL` severity to prioritize pedestrian safety.
3. **Spatial & Semantic Deduplication:** Clusters complaints reporting the same incident in the same ward. Instead of spawning duplicate work orders, citizens are prompted to upvote the existing ticket and track live field resolution.

Quantitative evaluation against our 20-sample ground-truth municipal dataset:
- Category Classification Accuracy: **100.0%** (20/20)
- Duplicate Detection Precision: **100.0%**
- Duplicate Detection Recall: **100.0%** (0 redundant work orders generated)
- Deduplication F1-Score: **100.0%**

Code, dataset, and evaluation benchmarks are completely open-source on GitHub:
👉 https://github.com/prathameshratthe/10week10projects

Onto Week 4: Voice2WorkOrder (multilingual voice-to-maintenance job cards).

#AI #FastAPI #React #FullStack #GovTech #CivicTech #100DaysOfCode #MachineLearning
