const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export class ApiClient {
  private static getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("acadflow_token");
  }

  public static setToken(token: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("acadflow_token", token);
    }
  }

  public static clearToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("acadflow_token");
      localStorage.removeItem("acadflow_user");
    }
  }

  public static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;

    try {
      const res = await fetch(url, {
        ...options,
        headers,
      });

      if (!res.ok) {
        let errMessage = `Error ${res.status}`;
        try {
          const errData = await res.json();
          errMessage = errData.detail || errData.message || JSON.stringify(errData);
        } catch (_) {}
        throw new Error(errMessage);
      }

      return await res.json();
    } catch (err: any) {
      console.error(`API Call failed: ${endpoint}`, err);
      throw err;
    }
  }

  // Auth endpoints
  static async login(email: string, password: string) {
    return this.request<any>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  static async register(full_name: string, email: string, password: string) {
    return this.request<any>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name, email, password }),
    });
  }

  static async demoLogin() {
    return this.request<any>("/auth/demo-login", {
      method: "POST",
    });
  }

  static async getMe() {
    return this.request<any>("/auth/me");
  }

  // Tasks
  static async getTasks(params?: { status?: string; course_id?: string; priority?: string }) {
    const q = new URLSearchParams();
    if (params?.status) q.append("status", params.status);
    if (params?.course_id) q.append("course_id", params.course_id);
    if (params?.priority) q.append("priority", params.priority);
    return this.request<any[]>(`/tasks?${q.toString()}`);
  }

  static async createTask(data: any) {
    return this.request<any>("/tasks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateTask(id: string, data: any) {
    return this.request<any>(`/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  static async updateTaskProgress(id: string, data: { progress?: number; minutes_spent?: number; status?: string }) {
    return this.request<any>(`/tasks/${id}/progress`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async deleteTask(id: string) {
    return this.request<any>(`/tasks/${id}`, { method: "DELETE" });
  }

  // Inbox
  static async extractInbox(raw_text: string, source_type = "text") {
    return this.request<any>("/inbox/extract", {
      method: "POST",
      body: JSON.stringify({ raw_text, source_type }),
    });
  }

  static async confirmInboxTasks(tasks: any[]) {
    return this.request<any[]>("/inbox/confirm", {
      method: "POST",
      body: JSON.stringify({ tasks }),
    });
  }

  static async uploadInboxScreenshot(formData: FormData) {
    return this.request<any>("/inbox/ocr", {
      method: "POST",
      body: formData,
    });
  }

  // Schedule & Planner
  static async getTodaySchedule() {
    return this.request<any>("/schedule/today");
  }

  static async generateSchedule(data: { available_hours: number; start_time?: string; include_breaks?: boolean }) {
    return this.request<any>("/schedule/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async adaptivelyReplan(data: {
    reason: string;
    affected_task_id?: string;
    minutes_completed?: number;
    hours_lost?: number;
    remaining_available_hours?: number;
  }) {
    return this.request<any>("/schedule/replan", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async toggleScheduleBlock(blockId: string) {
    return this.request<any>(`/schedule/blocks/${blockId}/toggle`, {
      method: "POST",
    });
  }

  // Courses
  static async getCourses() {
    return this.request<any[]>("/courses");
  }

  static async getCourse(id: string) {
    return this.request<any>(`/courses/${id}`);
  }

  static async getCourseTasks(id: string) {
    return this.request<any[]>(`/courses/${id}/tasks`);
  }

  static async createCourse(data: any) {
    return this.request<any>("/courses", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Knowledge & RAG
  static async getDocuments(course_id?: string) {
    const q = course_id ? `?course_id=${course_id}` : "";
    return this.request<any[]>(`/knowledge/documents${q}`);
  }

  static async uploadDocument(formData: FormData) {
    return this.request<any>("/knowledge/upload", {
      method: "POST",
      body: formData,
    });
  }

  static async queryKnowledge(query: string, course_id?: string) {
    return this.request<any>("/knowledge/query", {
      method: "POST",
      body: JSON.stringify({ query, course_id }),
    });
  }

  // Goals
  static async getGoals() {
    return this.request<any[]>("/goals");
  }

  static async createGoal(data: any) {
    return this.request<any>("/goals", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateGoal(id: string, data: any) {
    return this.request<any>(`/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Projects
  static async getProjects() {
    return this.request<any[]>("/projects");
  }

  static async createProject(data: any) {
    return this.request<any>("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async updateProjectTask(projectId: string, taskId: string, data: any) {
    return this.request<any>(`/projects/${projectId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Analytics
  static async getAnalytics() {
    return this.request<any>("/analytics");
  }

  // Notifications
  static async getNotifications() {
    return this.request<any[]>("/notifications");
  }

  static async markNotificationRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, { method: "POST" });
  }

  // Settings & AI
  static async getPreferences() {
    return this.request<any>("/settings/preferences");
  }

  static async updatePreferences(data: any) {
    return this.request<any>("/settings/preferences", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  static async getLLMConfig() {
    return this.request<any>("/settings/llm");
  }

  static async chatWithAssistant(message: string) {
    return this.request<any>("/ai/assistant", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }
}
