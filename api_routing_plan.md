# API Routing Security Mitigation Plan
Last Updated: April 27, 2025 7:43 PM IST

## Overview
This plan outlines the steps to improve security by moving client-side API calls that use sensitive environment variables (NEXT_PUBLIC_) to server-side API routes.

## Current Security Issues
1. **Gemini API Integration**
   - NEXT_PUBLIC_GEMINI_API_KEY exposed in client-side code
   - Direct API calls from client using exposed key
   
2. **Groq API Integration**
   - NEXT_PUBLIC_GROQ_API_KEY exposed in client-side code
   - Direct API calls from client using exposed key

3. **Firebase Configuration**
   - Multiple NEXT_PUBLIC_ variables for Firebase configuration
   - Potential security risks if Firebase rules are not properly configured

## Mitigation Steps

### 1. Server-Side API Routes Creation

#### Gemini API Routes
1. Create new API route: `src/app/api/ai/gemini/route.ts`
   ```typescript
   // Implementation will include:
   // - Input validation
   // - Error handling
   // - Rate limiting
   // - Response formatting
   ```

2. Move Gemini service logic to API route
   - Remove client-side API key usage
   - Implement proper error handling
   - Add request validation
   - Add rate limiting

#### Groq API Routes
1. Create new API route: `src/app/api/ai/groq/route.ts`
   ```typescript
   // Implementation will include:
   // - Input validation
   // - Error handling
   // - Rate limiting
   // - Response formatting
   ```

2. Move Groq service logic to API route
   - Remove client-side API key usage
   - Implement proper error handling
   - Add request validation
   - Add rate limiting

### 2. Environment Variables Update

1. Remove NEXT_PUBLIC_ prefix from sensitive variables:
   ```plaintext
   # Before
   NEXT_PUBLIC_GEMINI_API_KEY=xxx
   NEXT_PUBLIC_GROQ_API_KEY=xxx

   # After
   GEMINI_API_KEY=xxx
   GROQ_API_KEY=xxx
   ```

2. Update Firebase configuration:
   - Keep necessary NEXT_PUBLIC_ variables for Firebase client SDK
   - Add server-side variables for Firebase Admin SDK
   - Document which variables are safe to expose

### 3. Client-Side Code Updates

1. Update Gemini Service (`src/lib/gemini-service.ts`):
   ```typescript
   // Replace direct API calls with fetch to new API routes
   // Add proper error handling and loading states
   ```

2. Update Groq Service (`src/lib/groq-service.ts`):
   ```typescript
   // Replace direct API calls with fetch to new API routes
   // Add proper error handling and loading states
   ```

### 4. Firebase Security Enhancement

1. Review and update Firebase Security Rules:
   ```plaintext
   // Implement strict rules for:
   // - Data access
   // - User authentication
   // - Write permissions
   ```

2. Implement Firebase Admin SDK:
   - Create utility functions for admin operations
   - Use admin SDK for sensitive operations
   - Implement proper error handling

### 5. Testing Plan

1. API Route Testing:
   - Test input validation
   - Test error handling
   - Test rate limiting
   - Test response formatting

2. Client Integration Testing:
   - Test API route integration
   - Test error handling
   - Test loading states
   - Test user feedback

3. Security Testing:
   - Test API route protection
   - Test Firebase rules
   - Test rate limiting
   - Test input validation

## Implementation Timeline

1. **Week 1**: Server-side API Routes
   - Create API routes
   - Implement core functionality
   - Add security measures

2. **Week 2**: Client Updates
   - Update client-side code
   - Remove exposed API keys
   - Add error handling

3. **Week 3**: Firebase Security
   - Update Firebase rules
   - Implement Admin SDK
   - Test security measures

4. **Week 4**: Testing & Documentation
   - Comprehensive testing
   - Update documentation
   - Developer training

## Success Criteria

1. No sensitive API keys exposed in client-side code
2. All API calls properly routed through server
3. Proper error handling implemented
4. Rate limiting in place
5. Firebase rules properly configured
6. All tests passing
7. Documentation updated

## Monitoring & Maintenance

1. Regular security audits
2. Monitor API usage and errors
3. Update dependencies
4. Review and update Firebase rules
5. Monitor rate limiting effectiveness

## Emergency Response Plan

1. Document steps for handling security incidents
2. Create rollback procedures
3. Establish communication protocols
4. Define escalation procedures

## Documentation Updates

1. Update API documentation
2. Document security measures
3. Update development guidelines
4. Create troubleshooting guide