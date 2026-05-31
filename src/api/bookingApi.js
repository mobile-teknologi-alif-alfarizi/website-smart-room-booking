import axiosInstance from './authApi';

export const bookingApi = {
  getAllBookings: () => {
    return axiosInstance.get('/bookings');
  },

  createBooking: (data) => {
    return axiosInstance.post('/bookings', data);
  },
};
