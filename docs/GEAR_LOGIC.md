# Gear Logic

This document explains the gear logic and RPM calculations for the Car Sound Changer app. The system uses speed data to determine appropriate gear selection and calculates realistic engine sound parameters.

## Key Features:
- 1st Gear: 0-15 km/h (Shift at ~1500-2000 RPM)
- 2nd Gear: 15-30 km/h (Shift at ~1500-2000 RPM)  
- 3rd Gear: 30-50 km/h (Shift at ~1500-2000 RPM)
- 4th Gear: 50-70 km/h (Shift at ~1500-2000 RPM)
- 5th Gear: 70+ km/h (Cruising gear)

## Calculation Method:
The system uses speed-to-RPM conversion and gear ratio calculations to determine optimal gear selection.