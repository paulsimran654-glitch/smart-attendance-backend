# DAY-10 Progress – Smart Attendance Management System (Backend)

## Tasks Completed
- Implemented automated QR code generation using node-cron.
- Configured time-based QR generation:
  - Morning → Check-in QR
  - Evening → Check-out QR
- Added automatic QR expiration outside valid time windows.
- Implemented weekday restriction (Monday to Friday only).
- Added auto-absent logic for employees who do not check in by 9:31 AM.
- Integrated QR validation with:
  - Time window checks
  - Location validation
  - QR mode (check-in/check-out)

## Features Implemented
- Automated QR-based attendance system.
- Time-controlled QR activation and deactivation.
- Weekday-based attendance restriction.
- Auto-absent marking system.
- Real-time QR validation with security checks (time, location, mode).