import { describe, it, expect, beforeEach } from 'vitest';

// Simulated contract state
let networkFee = 100; // 1% fee
let chargingStations: Map<number, { owner: string; price: number; available: boolean }> = new Map();
let reservations: Map<number, { user: string; startTime: number; endTime: number }> = new Map();

// Helper function to simulate Clarity's unwrap!
function unwrap<T>(value: T | undefined, errorCode: number): T {
  if (value === undefined) {
    throw new Error(`Error: ${errorCode}`);
  }
  return value;
}

// Contract functions
function registerStation(stationId: number, price: number, caller: string) {
  chargingStations.set(stationId, { owner: caller, price, available: true });
  return true;
}

function updateStationPrice(stationId: number, newPrice: number, caller: string) {
  const station = unwrap(chargingStations.get(stationId), 404);
  if (station.owner !== caller) throw new Error('Error: 403');
  station.price = newPrice;
  chargingStations.set(stationId, station);
  return true;
}

function setStationAvailability(stationId: number, isAvailable: boolean, caller: string) {
  const station = unwrap(chargingStations.get(stationId), 404);
  if (station.owner !== caller) throw new Error('Error: 403');
  station.available = isAvailable;
  chargingStations.set(stationId, station);
  return true;
}

function makeReservation(stationId: number, startTime: number, endTime: number, caller: string) {
  const station = unwrap(chargingStations.get(stationId), 404);
  if (!station.available) throw new Error('Error: 400');
  reservations.set(stationId, { user: caller, startTime, endTime });
  station.available = false;
  chargingStations.set(stationId, station);
  return true;
}

function completeCharging(stationId: number, caller: string) {
  const station = unwrap(chargingStations.get(stationId), 404);
  const reservation = unwrap(reservations.get(stationId), 404);
  if (reservation.user !== caller) throw new Error('Error: 403');
  // Simulating STX transfer and fee calculation
  const fee = (station.price * networkFee) / 10000;
  // In a real implementation, we would handle the STX transfers here
  reservations.delete(stationId);
  station.available = true;
  chargingStations.set(stationId, station);
  return true;
}

function getStationInfo(stationId: number) {
  return chargingStations.get(stationId);
}

function getReservationInfo(stationId: number) {
  return reservations.get(stationId);
}

// Tests
describe('Charging Network Contract', () => {
  beforeEach(() => {
    chargingStations.clear();
    reservations.clear();
  });
  
  it('should register a station', () => {
    expect(registerStation(1, 100, 'owner1')).toBe(true);
    expect(getStationInfo(1)).toEqual({ owner: 'owner1', price: 100, available: true });
  });
  
  it('should update station price', () => {
    registerStation(1, 100, 'owner1');
    expect(updateStationPrice(1, 150, 'owner1')).toBe(true);
    expect(getStationInfo(1)?.price).toBe(150);
  });
  
  it('should not allow non-owner to update station price', () => {
    registerStation(1, 100, 'owner1');
    expect(() => updateStationPrice(1, 150, 'owner2')).toThrow('Error: 403');
  });
  
  it('should set station availability', () => {
    registerStation(1, 100, 'owner1');
    expect(setStationAvailability(1, false, 'owner1')).toBe(true);
    expect(getStationInfo(1)?.available).toBe(false);
  });
  
  it('should make a reservation', () => {
    registerStation(1, 100, 'owner1');
    expect(makeReservation(1, 1000, 2000, 'user1')).toBe(true);
    expect(getReservationInfo(1)).toEqual({ user: 'user1', startTime: 1000, endTime: 2000 });
    expect(getStationInfo(1)?.available).toBe(false);
  });
  
  it('should not allow reservation for unavailable station', () => {
    registerStation(1, 100, 'owner1');
    makeReservation(1, 1000, 2000, 'user1');
    expect(() => makeReservation(1, 2000, 3000, 'user2')).toThrow('Error: 400');
  });
  
  it('should complete charging', () => {
    registerStation(1, 100, 'owner1');
    makeReservation(1, 1000, 2000, 'user1');
    expect(completeCharging(1, 'user1')).toBe(true);
    expect(getReservationInfo(1)).toBeUndefined();
    expect(getStationInfo(1)?.available).toBe(true);
  });
  
  it('should not allow non-user to complete charging', () => {
    registerStation(1, 100, 'owner1');
    makeReservation(1, 1000, 2000, 'user1');
    expect(() => completeCharging(1, 'user2')).toThrow('Error: 403');
  });
});

