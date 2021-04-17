import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const NAMESPACE = 'main';

type ShowModalPayload = {
  // showModal: boolean;
  id: string;
  taskOrEvent: 'TASK' | 'EVENT';
  startDate: string;
}

const mainSlice = createSlice({
  name: NAMESPACE,
  initialState: {
    showModal: false,
    modalEditId: '',
    modalEditType: 'TASK' as 'TASK' | 'EVENT',
    modalStartDate: '',
  },
  reducers: {
    showModal: (state, action: PayloadAction<ShowModalPayload>) => {
      state.showModal = true;
      state.modalEditType = action.payload.taskOrEvent;
      if (action.payload.id) {
        state.modalEditId = action.payload.id;
      }
      if (action.payload.startDate) {
        state.modalStartDate = action.payload.startDate;
      }
    },
    hideModal: (state) => {
      state.showModal = false;
      state.modalEditId = '';
      state.modalStartDate = '';
    },
  },
});

export default mainSlice;
