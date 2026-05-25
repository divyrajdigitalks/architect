import { api } from "./api";
import endPointApi from "@/lib/endpoints";

export const attendanceService = {
  async getAllAttendance() {
    return api.get(endPointApi.attendance);
  },
  async getAttendanceByDate(date: string) {
    return api.get(`${endPointApi.attendance}?date=${date}`);
  },
  async markAttendance(attendanceData: any) {
    return api.post(endPointApi.attendance, attendanceData);
  },
  async updateAttendance(id: string, attendanceData: any) {
    return api.put(endPointApi.attendanceById(id), attendanceData);
  },
};
