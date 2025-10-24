import { DocumentInfo } from './types';

export const CASE_CONTEXT_SUMMARY = `
This is a high-conflict parenting matter (Lees v Lees, BRC8307/2024) for two children, Evie (12) and Tyler (10), both with ASD Level 2 and ADHD. 
The father, Joshua Lees (self-represented), is seeking to restore stability. The mother, Ella Lees, currently has primary care.
Core issues: Mother's escalating high-range methamphetamine use, criminal activity (stealing/fraud), and resulting educational neglect (children's school attendance is below 60%).
Father's situation: Documented history of stability, therapeutic engagement, and compliance with court orders. Clean drug tests. Has a formal diagnosis of ASD Level 2.
Mother's situation: Diagnosed with Stimulant Use Disorder (methamphetamine). History of non-compliance with court orders and inconsistent facilitation of father's time with children.
Current Orders (Jan 2025): Children live with Mother; Father's time is supervised.
Strategic Goal: For the children to be placed in the father's primary care, with the mother's time being supervised pending clean drug tests and therapeutic engagement, based on the significant risk of harm in the mother's care.
`;

export const PRELOADED_DOCUMENTS: DocumentInfo[] = [
  {
    id: 'psych_report',
    name: "Psychiatric Expert Report (Summary)",
    content: `
      PSYCHIATRIC EXPERT REPORT SUMMARY
      - Parties: Lees -v- Lees No. BRC8307/2024
      - Report of: Ms Ella Louise Lees
      - Summary:
        1. Ms Lees is a 31-year-old mother of two.
        2. Diagnosis: Meets DSM-5 criteria for Stimulant use disorder (methamphetamine), causing functional impairment and distress.
        3. Finding: Opinion that Ms Lees has impaired capacity to be a sole parent and may require support to co-parent effectively in the best interest of her children.
        4. Risk Factors (Self): Self-neglect, substance use disorder, vulnerability to exploitation.
        5. Risk Factors (Children): Risk of abuse and neglect due to parental substance use disorder, low self-esteem, psychosocial stressors, and unemployment.
    `
  },
  {
    id: 'court_order',
    name: "Court Order Summary (Jan 2025)",
    content: `
      COURT ORDER SUMMARY (22 January 2025)
      - Case: JOSHUA DYLAN LEES (Applicant) AND ELLA LOUISE LEES (Respondent)
      - File No: (P)BRC8307/2024
      - Key Orders (by consent):
        1. Live With: Children live with the mother.
        2. Spend Time With: Children spend supervised time with the father at Harmony House.
        3. Communication: Parents to use Our Family Wizard app. Father has scheduled phone calls twice a week.
        4. Injunctions: Both parents restrained from denigrating each other, using illicit substances while children are in their care, and discussing proceedings with children.
        5. Testing: Mother to submit to hair follicle testing.
        6. Psychiatric Assessment: A single expert psychiatrist to be appointed to report on the welfare of both parents.
    `
  },
  {
    id: 'case_handover',
    name: "Case Handover Brief (Summary)",
    content: `
      CASE HANDOVER BRIEF SUMMARY
      - Case: Lees v Lees (BRC8307/2024)
      - Core Issue: High-conflict parenting matter. Father seeks to restore stability due to mother's escalating methamphetamine use, criminal activity, and chronic educational neglect.
      - Father (Joshua): Documented stability, therapeutic engagement, compliant with orders.
      - Mother (Ella): Documented instability, high-range meth use, non-compliance, sentenced for stealing/fraud.
      - Children (Evie 12, Tyler 10): Diagnosed ASD/ADHD. School attendance has collapsed to <60%. Daughter (Evie) has disclosed emotional distress leading to an eating disorder.
      - Systemic Failures: QPS and Child Safety failed to act on father's protective reports, a finding validated by the Crime & Corruption Commission (CCC).
      - Strategic Objective: Seek urgent interim orders to place children in father's primary care due to overwhelming evidence of harm.
    `
  }
];
