# ClinicLine

ClinicLine is a local prototype for independent clinics. Its focus is **Slot Rescue**: when a patient cancels, the clinic can offer the released appointment to a consented waitlist patient and track whether the slot was recovered. The dashboard also includes appointment scheduling, call activity, callbacks, and a simulated multilingual receptionist.

## Run it

Requires Node.js 20 or newer. There are no package dependencies.

```sh
node server.js
```

Alternatively, run `npm.cmd start` on Windows or `npm start` on macOS/Linux.

Open [http://localhost:3000](http://localhost:3000). The app creates `data/clinic.json` on first start and stores demo appointments and callbacks there. Remove that file to reset the demo to its sample data.

## Try the product

1. Select **Try a sample call**.
2. Keep English selected and type: “I’d like to book an appointment tomorrow.”
3. Give a synthetic name and phone number when prompted.
4. Choose an offered time and confirm. See the appointment appear in the dashboard and schedule.
5. Start another call and ask for a clinic callback. Open **Callbacks** and mark it complete.
6. Ask a medical question to see the assistant decline to advise and create a staff handoff.
7. Open **Slot rescue** and simulate the next opted-in patient accepting or declining an offer. Accepted offers add an appointment; declines advance the queue. Open **Appointments** to cancel another visit and create a released slot.

The call panel uses browser speech recognition and speech synthesis when available; typed input works in every supported browser. Speech recognition usually requires a secure context, so it is available on `localhost` in browsers that implement the Web Speech API. Voice availability and quality vary by browser and installed voices, especially for Kannada and Hindi.

## What is implemented

- Responsive clinic dashboard with appointment, call, and callback views.
- Appointment creation with required-field checks and server-side slot conflict handling.
- Simulated conversational flow for appointments, clinic hours/location, and staff callbacks.
- Slot Rescue workflow: release a cancelled visit, offer it to an opted-in demo patient, simulate a response, and track recovered slots.
- English, Kannada, and Hindi conversation copy, plus browser voice input/output where supported.
- Explicit confirmation before voice-created appointments are saved.
- Medical-advice refusal and human callback handoff for sensitive requests.
- Local JSON persistence, no external services, accounts, or real telephony.

## Demo boundaries

This is a functional prototype, not a connected clinic service. It does not place or receive actual phone calls, send SMS messages, connect to Bolna, Plivo, Sarvam, Cartesia, Deepgram, or any clinic system. Slot offers require staff to choose a simulated response; the app does not contact the waitlisted person. The interface labels simulations and the dashboard uses synthetic patient examples. Browser speech recognition may use the browser vendor’s speech service; consult that browser’s privacy settings before microphone use. The simulation does not provide medical advice or emergency dispatch.

## Environment

- `PORT` (optional): HTTP port. Defaults to `3000`.
- All application records live in `data/clinic.json`.
