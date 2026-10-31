# Symphony Buildathon — Application Draft

## Project
**ClinicLine Slot Rescue — fill cancelled clinic appointments from an opted-in waitlist**

**One-line pitch:** When a patient cancels, ClinicLine calls the next opted-in patient in their preferred language, offers the open slot, and confirms the booking—or moves to the next person.

## Short description
Last-minute cancellations leave appointment slots empty while other patients wait for care. Staff often have to find the next patient, call them, explain the opening, and update the schedule manually. ClinicLine Slot Rescue gives opted-in patients a fair chance to take an earlier appointment: staff release a slot, the voice agent offers it in the patient’s preferred language, and a confirmed acceptance updates the schedule. If the patient declines or does not respond, the agent can move to the next eligible person. The dashboard shows the offer history and whether each released slot was recovered. The current workspace build demonstrates this flow with simulated responses; real outbound calls are a planned integration, not yet connected.

## The problem
For a small clinic, every late cancellation risks an empty slot that is difficult to refill quickly. Staff must call patients one by one, repeat the same information, wait for answers, and manually update the calendar. Meanwhile, patients who asked for an earlier appointment may not hear about an opening in time. Slot Rescue targets a specific, measurable outcome: reduce the time between cancellation and a confirmed replacement booking.

## Who it is for
Independent clinics and small practices in Bengaluru with frequent cancellations and patients willing to join an earlier-appointment waitlist. Initial callers are patients and caregivers who opt in to receive an offer by phone in their preferred language.

## What we will build
- A staff action to release a cancelled appointment slot.
- A consented waitlist with preferred language and fair offer order.
- An outbound voice offer in Kannada, Hindi, or English, with the date and time read back clearly.
- Explicit patient confirmation before a waitlist offer becomes a booking.
- A timeout or decline path that offers the slot to the next eligible patient.
- A staff dashboard with recovered-slot rate, time-to-fill, offer history, and a manual handoff when needed.
- An auditable demo mode so judges can inspect the offer, response, and resulting schedule change.

## What makes it useful and safe
Slot Rescue contacts only people who explicitly opted into earlier-appointment offers and respects their language and contact preferences. It offers a slot once, reads the date and time back, and books only after an explicit acceptance. The agent is for scheduling, not medical advice. A decline leaves the patient on the waitlist. Calls and data in this demo use synthetic patient records, and responses are simulated rather than sent to real people.

## Why voice
Patients can accept or decline an earlier appointment in a short phone conversation without installing an app or responding to a message in a language they may not prefer. Voice can clarify the exact date and time in the moment; SMS can provide a written confirmation afterward.

## How it works
1. Staff cancel a visit and release the slot.
2. ClinicLine selects the next available patient who opted into earlier-slot calls.
3. It calls in that patient’s preferred language and offers the specific date and time.
4. The patient accepts or declines; the agent reads the choice back and does not infer consent.
5. An accepted offer books the slot and sends confirmation. A declined or unanswered offer advances according to clinic policy.

## Technical approach
The current dependency-free Node.js prototype has a local JSON store, appointment dashboard, simulated waitlist offers, and a simulated inbound receptionist; browser voice input and output are optional. For the buildathon implementation, Bolna can orchestrate real-time outbound and inbound agents, Plivo can provide telephony and SMS, and Deepgram, Sarvam, and Cartesia can support speech and Indian-language experiences. The application backend owns consent, offer order, availability, booking, and audit logs; voice agents can access these through narrow tools. We will validate the languages with fluent speakers and test consent and opt-out behavior before any real outreach.

## Build plan
**Week 1:** Interview clinic staff about cancellation volume, current refill process, and acceptable waitlist consent; interview patients about offer preferences; refine the existing Slot Rescue demo around evidence.

**Week 2:** Connect outbound telephony and a Bolna voice agent; implement waitlist consent, offer ordering, and one reliable accept/decline cycle.

**Week 3:** Add Kannada/Hindi language handling, confirmation messages, opt-out, retries, human handoff, and the recovery dashboard. Test edge cases and failure recovery.

**Week 4:** Run observed tests with clinic staff and consented callers; fix misunderstandings; measure task completion and handoff quality.

**Week 5:** Polish reliability, prepare the live demo, and document results, limitations, and next steps.

## How we will measure success
- Measure the share of offered cancelled slots that become confirmed appointments.
- Measure median time from cancellation to refill, staff minutes per recovered slot, and opt-out/decline rates.
- Require explicit spoken confirmation before any offer changes the schedule.
- Do not contact patients without recorded, revocable consent for earlier-slot offers.
- Report results by language and disclose the number of real clinics and calls tested.

## Demo script (about 90 seconds)
1. Show a cancellation in the clinic dashboard and release the slot.
2. Select an opted-in waitlist patient with a different preferred language.
3. Simulate an outbound voice offer; show the caller accept or decline clearly.
4. On acceptance, show the appointment written to the schedule and the recovered-slot metric updated.
5. Run a decline case and show that the patient is not booked and can remain in the offer queue.
6. Show the offer audit log and the consent state used to select each patient.

## Why this team / why now
We want to solve a concrete operational problem with a measurable outcome: recover appointment capacity lost to cancellations. The project is deliberately narrow: opt-in waitlist, one released slot, a language-matched offer, explicit acceptance, and a confirmed booking. That gives clinics a clear way to judge value and gives us a focused workflow to validate before expanding into a general voice front desk.

## Application-ready answers

### What are you building?
We’re building ClinicLine Slot Rescue, a voice agent that helps independent clinics refill appointments after cancellations. Staff release a slot, and ClinicLine offers it to a patient who opted in to earlier appointments, using the patient’s preferred language. It updates the schedule only after the patient explicitly accepts and logs declines, opt-outs, and completed offers. Our current prototype simulates the workflow with synthetic data; we plan to connect real telephony and validate it with clinics during the buildathon.

### What problem are you solving?
When a patient cancels, small clinics often have to call down a list manually to find a replacement. That takes staff time, and the opening can expire before another patient accepts. Patients who want an earlier visit may not hear about the opening in time. We want to test whether a consent-based voice offer can refill the slot faster and reduce repetitive staff calls.

### Why are you building it?
We want voice AI to complete a measurable operational task, not stop at conversation. A cancelled slot has a clear start state and outcome: either another patient explicitly accepts and gets booked, or the slot remains open. Clinics can measure recovery time and staff effort, while patients get a fair chance to take an earlier visit.

### How will you use voice AI?
Voice is the offer and response channel. The agent calls a consented patient, explains one specific opening in the patient’s preferred language, confirms the exact date and time, and records accept, decline, or opt-out through limited backend tools. We plan to use Bolna for orchestration and connect telephony and speech services for real calls; the current demo simulates the outcome.

### What will you have built by the end?
We have a local dashboard and a simulated Slot Rescue flow today: staff can release a slot, choose an opted-in synthetic patient, record an accept or decline, and see the schedule and recovery log update. By the end, we plan to connect a working outbound phone flow and confirmation message, then report real clinic feedback and language-specific offer outcomes. Our final demo will show an accepted slot offer and the audit trail from release to booking.

### What is the hardest part?
Making sure an offer is accurate and respectful: the right patient, correct date and time, understandable language, and a genuine opt-in. We’ll constrain the agent to one offer per call, repeat the details, require an explicit yes, provide a clear opt-out, log every action, and never treat silence as acceptance. We’ll test with fluent speakers and real clinic staff before claiming reliability.

### Why use voice instead of manual calling or WhatsApp?
Manual calls make staff repeat the same offer patient by patient, while text offers can be missed or harder to use for patients who prefer speaking. We do not assume voice is always better: the pilot will compare refill time, staff effort, and patient preference with the clinic’s current process, and retain a human path for anyone who prefers it.

### How could this become a business?
We will first test whether a clinic has enough cancellations and enough opted-in patients to make recovered appointments valuable. We’ll compare a monthly per-clinic fee with a fee tied to completed recoveries, then validate willingness to pay through pilot conversations. We have not set pricing or proven demand yet.

## Customer validation pack

Use these questions in short conversations with clinic owners or front-desk staff. Record actual answers and counts; do not fill these in from assumptions.

1. In the last two weeks, how many appointments were cancelled within 24 hours?
2. What happens to those slots today? Who contacts patients, by what channel, and how long does it take?
3. How often is a cancelled slot refilled before the appointment time? How do you know?
4. Do patients ask to be contacted if an earlier slot opens? How is that preference recorded and withdrawn?
5. What would make an automated offer unacceptable or unsafe for your clinic?
6. Would you try a supervised pilot? What result would justify paying for it?

Capture the clinic role and type, date, direct quote with permission, cancellation/refill counts if available, current workflow, objection, and willingness to pilot. The strongest application update is a specific before/after result from a real clinic, even if the sample is small and clearly labeled.

## 30-second pitch

“A cancelled appointment can become an empty slot while another patient is waiting. ClinicLine Slot Rescue offers that opening to the next patient who opted into earlier appointments, in their preferred language, and books only after an explicit yes. Our prototype demonstrates the waitlist order, accept/decline flow, schedule update, and audit history. We’re now validating the real cancellation workflow with clinics and connecting a supervised phone pilot. We’ll measure refill rate, time to refill, and staff minutes saved.”

### What would you do with the prize / YC opportunity?
We would use the opportunity to test Slot Rescue with more independent clinics, learn whether it refills enough cancelled appointments to justify a paid product, and measure the operational impact against each clinic’s current process. The YC interview would help us pressure-test the customer problem, consent model, and path from a working prototype to a sustainable product.

## Before submitting
Replace or complete the team-specific facts below; do not claim interviews, pilots, metrics, or prior work that have not happened.

- **Founder names and roles:** Raksha - Student
- **Team size:** solo
- **Current project status:** live tests — state accurately
- **Customer evidence so far:** Not interviewed
- **Demo or project link:** 
- **Contact email and phone:** rakshanayak40@gmail.com - 6364402821
- **Availability for the Nov 5–7 interview and Nov 20 finale:** yes
