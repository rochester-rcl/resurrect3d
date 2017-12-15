/*@flow*/
import { CM, MM, IN } from '../constants/application';

export function cmToInches(measurement: Number): Number {
  return measurement * 0.0393701;
}

export function cmToMM(measurement: Number): Number {
  return measurement * 0.1;
}

export function convertUnits(unit: string, measurement: Number): Number {
  switch(unit) {
    case(CM):
      return measurement;

    case(MM):
      return cmToMM(measurement);

    case(IN):
      return cmToInches(measurement);

    default:
      return measurement;
  }
}
