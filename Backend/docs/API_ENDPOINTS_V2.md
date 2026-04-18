# API Endpoints - LMS V2

## Admin Users Management & Dashboard

---

## 1️⃣ **ADMIN: Get All Users (with Filters)**

**Endpoint:** `GET /api/users`

**Auth:** Protected (Admin only)

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `search` (string): Search by name or email (regex, case-insensitive)
- `role` (string): Filter by role: `student`, `instructor`, `admin`
- `status` (string): Filter by status: `active`, `inactive`
- `sortBy` (string): Sort field: `name`, `email`, `role`, `createdAt`, `lastLoginAt` (default: `createdAt`)
- `sortOrder` (string): Sort order: `asc`, `desc` (default: `desc`)
- `isEmailVerified` (string): Filter by verification: `true`, `false`

**Example Request:**

```bash
GET /api/users?page=1&limit=10&search=john&role=student&status=active&sortBy=name&sortOrder=asc
```

**Response:**

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 50,
  "totalPages": 5,
  "users": [
    {
      "_id": "userId1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://...",
      "role": "student",
      "isEmailVerified": true,
      "createdAt": "2026-04-01T00:00:00Z",
      "updatedAt": "2026-04-15T00:00:00Z",
      "isActive": true,
      "lastLoginAt": "2026-04-17T10:30:00Z",
      "enrollmentCount": 3,
      "courseCount": 0
    }
  ]
}
```

---

## 2️⃣ **ADMIN: Get User Details**

**Endpoint:** `GET /api/users/:id`

**Auth:** Protected (Admin only)

**Response:**

```json
{
  "success": true,
  "user": {
    "_id": "userId1",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "role": "student",
    "isEmailVerified": true,
    "isActive": true,
    "lastLoginAt": "2026-04-17T10:30:00Z",
    "createdAt": "2026-04-01T00:00:00Z",
    "updatedAt": "2026-04-15T00:00:00Z",
    "enrollmentCount": 3,
    "courseCount": 0
  }
}
```

---

## 3️⃣ **ADMIN: Update User**

**Endpoint:** `PUT /api/users/:id`

**Auth:** Protected (Admin only)

**Body:**

```json
{
  "name": "Jane Doe",
  "role": "instructor",
  "isEmailVerified": true
}
```

**Response:**

```json
{
  "success": true,
  "message": "User updated successfully",
  "user": {
    "id": "userId1",
    "name": "Jane Doe",
    "email": "john@example.com",
    "avatar": "https://...",
    "role": "instructor",
    "isEmailVerified": true
  }
}
```

---

## 4️⃣ **ADMIN: Delete/Deactivate User**

**Endpoint:** `DELETE /api/users/:id`

**Auth:** Protected (Admin only)

**Body (Optional):**

```json
{
  "permanent": false // true for hard delete (default: false)
}
```

**Behavior:**

- `permanent: false` (default) → Soft delete (Deactivate)
  - Sets `isActive: false`
  - Records `deactivatedAt` & `deactivatedBy`
  - User data remains in database
- `permanent: true` → Hard delete
  - Deletes user permanently
  - Deletes user's courses
  - Deletes user's enrollments
  - ⚠️ Cannot delete admin users

**Response (Soft Delete):**

```json
{
  "success": true,
  "message": "User deactivated successfully",
  "user": {
    "id": "userId1",
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": false
  }
}
```

---

## 5️⃣ **ADMIN: Get User Enrollments**

**Endpoint:** `GET /api/users/:id/enrollments`

**Auth:** Protected (Admin only)

**Query Parameters:**

- `page` (number): Page number
- `limit` (number): Items per page

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "userId1",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "page": 1,
  "limit": 10,
  "total": 5,
  "totalPages": 1,
  "enrollments": [
    {
      "_id": "enrollmentId1",
      "course": { ... },
      "status": "active",
      "progressPercent": 45,
      "enrolledAt": "2026-04-01T00:00:00Z"
    }
  ]
}
```

---

## 6️⃣ **ADMIN: Get User Courses (Instructor)**

**Endpoint:** `GET /api/users/:id/courses`

**Auth:** Protected (Admin only)

**Query Parameters:**

- `page` (number)
- `limit` (number)

**Note:** Only for instructors/admins

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "instructorId1",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "instructor"
  },
  "page": 1,
  "limit": 10,
  "total": 3,
  "totalPages": 1,
  "courses": [ ... ]
}
```

---

## 7️⃣ **BULK: Deactivate Multiple Users**

**Endpoint:** `POST /api/users/bulk/deactivate`

**Auth:** Protected (Admin only)

**Body:**

```json
{
  "userIds": ["userId1", "userId2", "userId3"],
  "reason": "Policy violation" // Optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "3 user(s) deactivated",
  "result": {
    "matchedCount": 3,
    "modifiedCount": 3,
    "reason": "Policy violation"
  }
}
```

---

## 8️⃣ **BULK: Activate Multiple Users**

**Endpoint:** `POST /api/users/bulk/activate`

**Auth:** Protected (Admin only)

**Body:**

```json
{
  "userIds": ["userId1", "userId2"]
}
```

**Response:**

```json
{
  "success": true,
  "message": "2 user(s) activated",
  "result": {
    "matchedCount": 2,
    "modifiedCount": 2
  }
}
```

---

## 9️⃣ **BULK: Change Role for Multiple Users**

**Endpoint:** `POST /api/users/bulk/update-role`

**Auth:** Protected (Admin only)

**Body:**

```json
{
  "userIds": ["userId1", "userId2"],
  "newRole": "instructor" // Required: student, instructor, admin
}
```

**Response:**

```json
{
  "success": true,
  "message": "Role updated for 2 user(s)",
  "result": {
    "matchedCount": 2,
    "modifiedCount": 2
  }
}
```

**Safety Rules:**

- Cannot remove the last admin in the system

---

## 🔟 **BULK: Delete Multiple Users**

**Endpoint:** `POST /api/users/bulk/delete`

**Auth:** Protected (Admin only)

**Body:**

```json
{
  "userIds": ["userId1", "userId2"],
  "permanent": false // Optional (default: false)
}
```

**Behavior:**

- Same as single user delete
- Soft delete (default): Deactivate users
- Hard delete (`permanent: true`): Delete permanently with all data
- Cannot delete admin users

**Response:**

```json
{
  "success": true,
  "message": "2 user(s) deactivated",
  "result": {
    "matchedCount": 2,
    "modifiedCount": 2
  }
}
```

---

## 👨‍🏫 **INSTRUCTOR: Get Their Students**

**Endpoint:** `GET /api/courses/instructor/students`

**Auth:** Protected (Instructor/Admin only)

**Query Parameters:**

- `courseId` (string): Optional - Filter by specific course
- `enrollmentStatus` (string): Optional - `active`, `completed`, `cancelled` (default: `active`)
- `search` (string): Optional - Search by student name/email
- `page` (number): Optional
- `limit` (number): Optional

**Example Request:**

```bash
GET /api/courses/instructor/students?courseId=courseId1&enrollmentStatus=active&search=john
```

**Response:**

```json
{
  "success": true,
  "page": 1,
  "limit": 10,
  "total": 25,
  "totalPages": 3,
  "students": [
    {
      "id": "enrollmentId1",
      "studentId": "userId1",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "https://...",
      "enrollmentStatus": "active",
      "progressPercent": 45,
      "lastAccessedAt": "2026-04-17T10:30:00Z",
      "courseName": "React Basics"
    }
  ]
}
```

---

## 👥 **STUDENT: Get Classmates in Course**

**Endpoint:** `GET /api/courses/:courseId/classmates`

**Auth:** Protected (Student only)

**Note:** Student must be enrolled in the course

**Response:**

```json
{
  "success": true,
  "total": 15,
  "classmates": [
    {
      "id": "userId2",
      "name": "Jane Smith",
      "avatar": "https://...",
      "progressPercent": 78
    }
  ]
}
```

---

## 📊 **New User Model Fields**

```json
{
  "_id": "ObjectId",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar": "https://...",
  "role": "student", // student, instructor, admin
  "isEmailVerified": false,
  "isActive": true, // NEW: For soft delete
  "deactivatedAt": null, // NEW: When user was deactivated
  "deactivatedBy": null, // NEW: User ID who deactivated them
  "lastLoginAt": "2026-04-17T10:30:00Z", // NEW: Track last login
  "lastSeenAt": "2026-04-17T10:30:00Z", // NEW: Track activity
  "stats": {
    // NEW: Denormalized counts
    "enrolledCoursesCount": 3,
    "createdCoursesCount": 2
  },
  "createdAt": "2026-04-01T00:00:00Z",
  "updatedAt": "2026-04-15T00:00:00Z"
}
```

---

## 🔄 **Auto-Updated Stats**

These fields are automatically updated via Mongoose hooks:

| Action                            | Field                        | Change |
| --------------------------------- | ---------------------------- | ------ |
| User enrolls in course            | `stats.enrolledCoursesCount` | +1     |
| User unenrolls/enrollment deleted | `stats.enrolledCoursesCount` | -1     |
| Instructor creates course         | `stats.createdCoursesCount`  | +1     |
| Instructor's course deleted       | `stats.createdCoursesCount`  | -1     |

No need to manually update - happens automatically! ✨

---

## ⚙️ **Error Responses**

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

**Common Status Codes:**

- `400`: Bad request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found
- `500`: Server error

---

## 🛡️ **Security Notes**

✅ All endpoints require authentication
✅ Admin role required for user management
✅ Instructor can only see their own students
✅ Student can only see classmates in enrolled courses
✅ Cannot delete/downgrade last admin
✅ Admin deletion prevented (must deactivate first)
✅ Soft delete enabled by default (data recovery possible)

---

## 📱 **Usage Examples**

### Example 1: Admin Dashboard - Get Active Students

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/users?role=student&status=active&sortBy=name"
```

### Example 2: Admin - Bulk Deactivate Policy Violators

```bash
curl -X POST http://localhost:3000/api/users/bulk/deactivate \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userIds": ["id1", "id2", "id3"],
    "reason": "Violated community guidelines"
  }'
```

### Example 3: Instructor Dashboard - View Students in Course

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/courses/instructor/students?courseId=courseId1"
```

### Example 4: Student - View Classmates

```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/api/courses/courseId1/classmates"
```

---

## ✅ **Implementation Checklist**

- [x] User Model: Added `isActive`, `deactivatedAt`, `deactivatedBy`, `lastLoginAt`, `lastSeenAt`, `stats`
- [x] User Controller: getAllUsers with filters, sorting, bulk operations
- [x] User Validators: Schema for all operations
- [x] User Routes: All endpoints wired
- [x] Enrollment Hooks: Auto-update enrolled count on enrollment/delete
- [x] Course Hooks: Auto-update created count on course delete
- [x] Instructor Students: New endpoint with filtering
- [x] Student Classmates: New endpoint with privacy
- [x] Error Handling: Proper validation and error messages
- [x] Documentation: Complete API docs

---

**Version:** 2.0  
**Last Updated:** April 17, 2026
