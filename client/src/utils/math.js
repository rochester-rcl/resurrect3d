/*@flow*/
import { CM, MM, IN, CONVERSIONS } from '../constants/application';

export function cmToInches(measurement: number): number {
  return measurement * 0.393701;
}

export function cmToMM(measurement: number): number {
  return measurement * 0.1;
}

export function inchesToCM(measurement: number): number {
  return measurement * 2.54;
}

export function convertUnits(from: string, to: string, measurement: number): number {
  console.log(from, to);
  from = from.toUpperCase();
  if (from === to) return measurement;
  let conversion = from + '_TO_' + to;
  let cback = CONVERSIONS[conversion];
  return (cback !== undefined) ? cback(measurement) : measurement;
}
