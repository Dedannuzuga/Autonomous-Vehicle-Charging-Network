# Charging Network Smart Contract

## Overview

This Stacks smart contract implements a decentralized charging station reservation and management system. It allows station owners to register charging stations, set prices, manage availability, and enables users to make reservations and complete charging sessions.

## Features

- Station Registration
- Price Updates
- Availability Management
- Reservation System
- Charging Session Completion
- Network Fee Collection

## Contract Data Structures

### Variables
- `network-fee`: Defines the network fee percentage (currently set at 1%)

### Maps
- `charging-stations`: Stores information about charging stations
    - `station-id`: Unique identifier for the station
    - `owner`: Principal (address) of the station owner
    - `price`: Charging price per session
    - `available`: Station availability status

- `reservations`: Tracks active reservations
    - `station-id`: Unique identifier for the station
    - `user`: Principal (address) of the reservation holder
    - `start-time`: Reservation start time
    - `end-time`: Reservation end time

## Functions

### Station Management
- `register-station`: Register a new charging station
    - Parameters: `station-id`, `price`
    - Restrictions: Only callable by station owner

- `update-station-price`: Update the price of a charging station
    - Parameters: `station-id`, `new-price`
    - Restrictions: Only callable by station owner

- `set-station-availability`: Toggle station availability
    - Parameters: `station-id`, `is-available`
    - Restrictions: Only callable by station owner

### Reservation and Charging
- `make-reservation`: Create a reservation for a charging station
    - Parameters: `station-id`, `start-time`, `end-time`
    - Restrictions: Station must be available

- `complete-charging`: Finalize a charging session
    - Transfers charging price to station owner
    - Collects network fee
    - Resets station availability
    - Restrictions: Only callable by reservation user

### Read-Only Functions
- `get-station-info`: Retrieve information about a specific charging station
- `get-reservation-info`: Retrieve reservation details for a station

## Error Codes
- `u404`: Station or reservation not found
- `u403`: Unauthorized access
- `u400`: Station unavailable

## Network Fee
- Current fee: 1% of charging price
- Collected by the contract and transferred to the contract owner

## Usage Example

1. Station Owner registers a charging station
2. User makes a reservation
3. User completes charging session
4. Station owner and network receive payments

## Security Considerations
- Owner-only functions have strict access controls
- Reservations and charging sessions have state checks
- Network fee is automatically calculated and transferred

## Potential Improvements
- Add cancellation mechanism for reservations
- Implement more complex pricing models
- Add reputation system for station owners and users

## License
[Insert appropriate license here]

## Contact
[Insert contact information or project repository]
