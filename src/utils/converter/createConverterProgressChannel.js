import { eventChannel, END } from "redux-saga";
import ConverterProgress from "./ConverterProgress";

export default function createConverterProgressChannel(
  converterProgress: ConverterProgress
): void {
  const {
    UPDATE_CONVERSION_PROGRESS,
    DONE,
    CONVERSION_ERROR
  } = converterProgress.EVENT_TYPES;
  return eventChannel(emit => {
    converterProgress.on(UPDATE_CONVERSION_PROGRESS, payload => {
      emit({
        type: UPDATE_CONVERSION_PROGRESS,
        payload: payload
      });
    });

    converterProgress.on(CONVERSION_ERROR, payload => {
      emit({
        type: CONVERSION_ERROR,
        message: payload.error.stack,
      });
      emit(END);
    });

    converterProgress.on(DONE, payload => {
      emit({
        type: DONE,
        file: payload.file
      });
      emit(END);
    });

    const unsubscribe = () => {
      converterProgress.removeAll();
    };

    return unsubscribe;
  });
}
