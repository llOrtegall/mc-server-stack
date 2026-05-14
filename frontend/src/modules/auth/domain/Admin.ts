export interface AdminPrimitives {
  id: string;
  email: string;
  createdAt: string;
}

export class Admin {
  private readonly id: string;
  private readonly email: string;
  private readonly createdAt: string;

  private constructor(id: string, email: string, createdAt: string) {
    this.id = id;
    this.email = email;
    this.createdAt = createdAt;
  }

  static fromPrimitive(data: AdminPrimitives): Admin {
    if (!data) throw new Error('Admin data must be provided');
    return new Admin(data.id, data.email, data.createdAt);
  }

  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getCreatedAt(): string {
    return this.createdAt;
  }

  toPrimitive(): AdminPrimitives {
    return { id: this.id, email: this.email, createdAt: this.createdAt };
  }
}
