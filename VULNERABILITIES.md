# Security Vulnerabilities Documentation

## Overview
This document outlines the intentional security vulnerabilities implemented in the Insecure Wallet application for educational and penetration testing purposes.

## Implemented Vulnerabilities

### 1. Insecure Direct Object References (IDOR) - A01:2021 Broken Access Control

**Location:** Multiple endpoints
- `/api/user/:userId` - Get user profile
- `/api/balance/:userId` - Get user balance  
- `/api/transactions/:userId` - Get transaction history

**Vulnerability Description:**
The application allows any authenticated user to access other users' data by simply changing the `userId` parameter in the URL. There are no authorization checks to verify if the requesting user has permission to access the specified user's data.

**Exploitation:**
1. Login as any user
2. Note your user ID from the dashboard
3. Change the user ID in API requests to access other users' data
4. Example: `GET /api/user/[OTHER_USER_ID]` will return another user's profile information

**Impact:**
- Unauthorized access to sensitive user information
- Privacy violations
- Data exposure

### 2. Broken Authentication - A07:2021 Identification and Authentication Failures

**Location:** JWT Token Implementation

**Vulnerabilities:**
- **Weak JWT Secret:** Uses easily guessable secret "secret123"
- **No Token Expiration:** JWT tokens never expire
- **No Rate Limiting:** No protection against brute force attacks
- **Weak Password Requirements:** Accepts very weak passwords (e.g., "123")

**Exploitation:**
1. **JWT Secret Cracking:** The weak secret can be brute-forced to forge tokens
2. **Token Reuse:** Tokens remain valid indefinitely, even after logout
3. **Brute Force:** No rate limiting allows unlimited login attempts

**Impact:**
- Account takeover
- Persistent unauthorized access
- Token forgery

### 3. Missing Authorization Controls - A01:2021 Broken Access Control

**Location:** Admin endpoints
- `/api/admin/users` - View all users
- `/api/admin/modify-balance` - Modify user balances

**Vulnerability Description:**
Admin endpoints only check if a user is authenticated but do not verify if they have admin privileges. Any authenticated user can access admin functions.

**Exploitation:**
1. Login as a regular user
2. Make requests to admin endpoints
3. Successfully access admin functions without proper authorization

**Impact:**
- Privilege escalation
- Unauthorized administrative access
- Data manipulation

### 4. Information Disclosure

**Location:** Multiple areas
- Error messages reveal internal system details
- User registration returns sensitive information
- JWT verification errors expose implementation details

**Vulnerability Description:**
The application exposes sensitive information through error messages and API responses.

**Exploitation:**
- Error messages provide debugging information to attackers
- Registration responses include user IDs and roles
- Failed JWT verification reveals token structure

**Impact:**
- Information leakage
- Reconnaissance assistance for attackers
- System fingerprinting

### 5. Weak Session Management

**Location:** Authentication system

**Vulnerability Description:**
- No proper session invalidation on logout
- Tokens stored in localStorage (vulnerable to XSS)
- No session timeout mechanisms

**Exploitation:**
1. Obtain a user's token through XSS or other means
2. Use the token indefinitely as it never expires
3. Access remains valid even after user "logs out"

**Impact:**
- Session hijacking
- Persistent unauthorized access
- Token theft consequences

## Testing the Vulnerabilities

The application includes a built-in vulnerability testing panel accessible via the red "Vulnerability Testing" button. This panel provides automated tests for:

1. **IDOR Testing:** Attempts to access other users' data
2. **Authentication Bypass:** Tests for authentication weaknesses
3. **Admin Access:** Verifies admin privilege escalation

## Remediation Preview

The following phase will implement proper security controls to address these vulnerabilities:

1. **Proper Authorization Checks:** Verify user permissions before data access
2. **Strong JWT Implementation:** Secure secrets, expiration, and validation
3. **Role-Based Access Control:** Implement proper admin authorization
4. **Secure Session Management:** Proper token handling and invalidation
5. **Input Validation:** Sanitize and validate all user inputs
6. **Rate Limiting:** Implement brute force protection
7. **Error Handling:** Sanitize error messages to prevent information disclosure

## Educational Purpose

These vulnerabilities are intentionally implemented for educational purposes to demonstrate:
- Common web application security flaws
- OWASP Top 10 vulnerabilities in practice
- Penetration testing techniques
- Security remediation strategies

**WARNING:** This application should never be deployed in a production environment or exposed to the internet without proper security controls.

