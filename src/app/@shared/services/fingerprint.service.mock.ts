export class MockFingerprintjsProService {
  getVisitorData() {
    return Promise.resolve({ visitorId: 'mocked-id' });
  }
}
