import { api } from "./api";

export const attendanceService = {
  async getAllAttendance() {
    return api.get("/attendance");
  },
  async getAttendanceByDate(date: string) {
    return api.get(`/attendance?date=${date}`);
  },
  async markAttendance(attendanceData: any) {
    return api.post("/attendance", attendanceData);
  },
  async updateAttendance(id: string, attendanceData: any) {
    return api.put(`/attendance/${id}`, attendanceData);
  },
};
