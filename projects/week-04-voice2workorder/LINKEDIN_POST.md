# LinkedIn Post — Week 04: Voice2WorkOrder

Ask any HVAC, electrical, or plumbing service contractor what hurts their gross margin most:
It isn't equipment cost — it's **unlogged field time and unbilled parts**.

Technicians servicing 6 sites a day don't want to type dropdown forms on greasy smartphone screens. They send 15-second voice notes to their supervisor in Hindi, Marathi, or Hinglish:
*"Sharma ji ke yahan dedh ghanta laga, 45 MFD capacitor replace kiya, cooling theek ho gayi."*

By Friday, that voice note is buried in WhatsApp, the ₹450 capacitor is forgotten, and 1.5 hours of skilled labor goes unbilled.

For Week 4 of my #10WeekAIBuilderChallenge, I built **Voice2WorkOrder** 🎙️🔧:
An AI engine that turns messy multilingual technician voice dictations into structured commercial work orders, itemized invoices, and printable job cards.

Key Highlights:
1. **Vernacular Idiom Normalization:** Maps expressions like "dedh ghanta", "dhai ghante", and "ardha taas" directly into exact decimal billable hours.
2. **Zero-Hallucination Hardware Extraction:** When a technician cleans a filter without replacing parts, parts cost stays strictly ₹0.00. When hardware is used, it itemizes quantities and rates automatically.
3. **One-Click Commercial Job Card:** Formats professional invoices ready for customer signoff, PDF printing, or ERP sync.

Quantitative evaluation against our 20-sample multilingual technician dataset:
- Trade Classification: **100.0%** (20/20)
- Labor Hours Accuracy: **100.0%** (20/20)
- Parts Detection Accuracy: **100.0%** (20/20)
- Priority Level Accuracy: **100.0%** (20/20)
- Overall Multi-Field Accuracy: **100.0%**

Open-source code, dataset, and benchmark report are on GitHub:
👉 https://github.com/prathameshratthe/10week10projects

Week 5 next: SchemeSathi (multilingual Indian welfare scheme eligibility assistant with citation grounding).

#AI #FastAPI #React #FullStack #FieldService #SpeechAI #HinglishNLP #100DaysOfCode
