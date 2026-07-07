import { describe, it, expect } from 'vitest';

// Import API modules to verify they're properly structured
describe('API Service Structure', () => {
  it('should have authAPI with all required methods', async () => {
    const { authAPI } = await import('./api');
    
    expect(authAPI).toBeDefined();
    expect(typeof authAPI.register).toBe('function');
    expect(typeof authAPI.login).toBe('function');
    expect(typeof authAPI.logout).toBe('function');
    expect(typeof authAPI.refreshToken).toBe('function');
  });

  it('should have usersAPI with all required methods', async () => {
    const { usersAPI } = await import('./api');
    
    expect(usersAPI).toBeDefined();
    expect(typeof usersAPI.getMe).toBe('function');
    expect(typeof usersAPI.updateMe).toBe('function');
    expect(typeof usersAPI.getUserById).toBe('function');
    expect(typeof usersAPI.deleteAccount).toBe('function');
  });

  it('should have coursesAPI with all required methods', async () => {
    const { coursesAPI } = await import('./api');
    
    expect(coursesAPI).toBeDefined();
    expect(typeof coursesAPI.listCourses).toBe('function');
    expect(typeof coursesAPI.getCourseById).toBe('function');
    expect(typeof coursesAPI.createCourse).toBe('function');
    expect(typeof coursesAPI.updateCourse).toBe('function');
    expect(typeof coursesAPI.deleteCourse).toBe('function');
    expect(typeof coursesAPI.getCourseLessons).toBe('function');
  });

  it('should have lessonsAPI with all required methods', async () => {
    const { lessonsAPI } = await import('./api');
    
    expect(lessonsAPI).toBeDefined();
    expect(typeof lessonsAPI.getLessonById).toBe('function');
    expect(typeof lessonsAPI.createLesson).toBe('function');
    expect(typeof lessonsAPI.updateLesson).toBe('function');
    expect(typeof lessonsAPI.deleteLesson).toBe('function');
    expect(typeof lessonsAPI.markLessonComplete).toBe('function');
    expect(typeof lessonsAPI.getTranscript).toBe('function');
  });

  it('should have enrollmentsAPI with all required methods', async () => {
    const { enrollmentsAPI } = await import('./api');
    
    expect(enrollmentsAPI).toBeDefined();
    expect(typeof enrollmentsAPI.enrollInCourse).toBe('function');
    expect(typeof enrollmentsAPI.getUserEnrollments).toBe('function');
    expect(typeof enrollmentsAPI.getEnrollmentById).toBe('function');
    expect(typeof enrollmentsAPI.unenrollFromCourse).toBe('function');
  });

  it('should have certificatesAPI with all required methods', async () => {
    const { certificatesAPI } = await import('./api');
    
    expect(certificatesAPI).toBeDefined();
    expect(typeof certificatesAPI.getUserCertificates).toBe('function');
    expect(typeof certificatesAPI.getCertificateById).toBe('function');
    expect(typeof certificatesAPI.verifyCertificate).toBe('function');
    expect(typeof certificatesAPI.downloadCertificate).toBe('function');
  });

  it('should have creatorsAPI with all required methods', async () => {
    const { creatorsAPI } = await import('./api');
    
    expect(creatorsAPI).toBeDefined();
    expect(typeof creatorsAPI.applyAsCreator).toBe('function');
    expect(typeof creatorsAPI.getMyApplication).toBe('function');
    expect(typeof creatorsAPI.getCreatorDashboard).toBe('function');
    expect(typeof creatorsAPI.getCreatorCourses).toBe('function');
    expect(typeof creatorsAPI.getCreatorAnalytics).toBe('function');
  });

  it('should have adminAPI with all required methods', async () => {
    const { adminAPI } = await import('./api');
    
    expect(adminAPI).toBeDefined();
    expect(typeof adminAPI.listCreatorApplications).toBe('function');
    expect(typeof adminAPI.reviewApplication).toBe('function');
    expect(typeof adminAPI.getPlatformAnalytics).toBe('function');
    expect(typeof adminAPI.listUsers).toBe('function');
    expect(typeof adminAPI.updateUserRole).toBe('function');
    expect(typeof adminAPI.deleteUser).toBe('function');
    expect(typeof adminAPI.getSkillDemandAnalytics).toBe('function');
  });

  it('should have careerAPI with all required methods', async () => {
    const { careerAPI } = await import('./api');
    
    expect(careerAPI).toBeDefined();
    expect(typeof careerAPI.createOrUpdateProfile).toBe('function');
    expect(typeof careerAPI.analyzeSkillGap).toBe('function');
    expect(typeof careerAPI.generateRoadmap).toBe('function');
    expect(typeof careerAPI.getDashboard).toBe('function');
  });
});
