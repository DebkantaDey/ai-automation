import { SsrfProtectionService } from '../ssrf-protection.service';

describe('SSRF Protection Service (Module 57)', () => {
  let ssrfService: SsrfProtectionService;

  beforeEach(() => {
    ssrfService = new SsrfProtectionService();
  });

  it('should allow valid public HTTPS and HTTP URLs', () => {
    const parsed1 = ssrfService.validateUrl('https://api.github.com/repos');
    expect(parsed1.hostname).toBe('api.github.com');

    const parsed2 = ssrfService.validateUrl('https://hooks.slack.com/services/T00/B00/X00');
    expect(parsed2.hostname).toBe('hooks.slack.com');
  });

  it('should block localhost and loopback IP addresses (127.0.0.1)', () => {
    expect(() => ssrfService.validateUrl('http://localhost:3000/api/internal')).toThrow(
      /blocked \(SSRF Protection\)/,
    );
    expect(() => ssrfService.validateUrl('http://127.0.0.1:8080/admin')).toThrow(
      /blocked \(SSRF Protection\)/,
    );
  });

  it('should block private RFC-1918 internal networks (10.x, 192.168.x, 172.16.x)', () => {
    expect(() => ssrfService.validateUrl('http://10.0.1.50/metrics')).toThrow(
      /blocked \(SSRF Protection\)/,
    );
    expect(() => ssrfService.validateUrl('http://192.168.1.1/router')).toThrow(
      /blocked \(SSRF Protection\)/,
    );
    expect(() => ssrfService.validateUrl('http://172.16.0.10/database')).toThrow(
      /blocked \(SSRF Protection\)/,
    );
  });

  it('should block AWS/GCP cloud metadata services (169.254.169.254)', () => {
    expect(() => ssrfService.validateUrl('http://169.254.169.254/latest/meta-data/')).toThrow(
      /blocked \(SSRF Protection\)/,
    );
  });
});
