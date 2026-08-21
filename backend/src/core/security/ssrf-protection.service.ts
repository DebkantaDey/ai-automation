import { Injectable, BadRequestException } from '@nestjs/common';
import * as net from 'net';

@Injectable()
export class SsrfProtectionService {
  private readonly BLOCKED_HOSTS = new Set([
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    'metadata.google.internal',
    '169.254.169.254', // AWS/GCP instance metadata service
  ]);

  private isPrivateIp(ip: string): boolean {
    if (net.isIPv4(ip)) {
      const parts = ip.split('.').map(Number);
      // 127.0.0.0/8 (Loopback)
      if (parts[0] === 127) return true;
      // 10.0.0.0/8 (Private network)
      if (parts[0] === 10) return true;
      // 172.16.0.0/12 (Private network)
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      // 192.168.0.0/16 (Private network)
      if (parts[0] === 192 && parts[1] === 168) return true;
      // 169.254.0.0/16 (Link-local / Cloud Metadata)
      if (parts[0] === 169 && parts[1] === 254) return true;
      // 0.0.0.0
      if (parts[0] === 0) return true;
    } else if (net.isIPv6(ip)) {
      // IPv6 Loopback or Unique Local Address (fc00::/7)
      if (ip === '::1' || ip.toLowerCase().startsWith('fc') || ip.toLowerCase().startsWith('fd')) {
        return true;
      }
    }
    return false;
  }

  validateUrl(urlString: string): URL {
    let parsed: URL;
    try {
      parsed = new URL(urlString);
    } catch {
      throw new BadRequestException('Invalid URL format');
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new BadRequestException(`Protocol '${parsed.protocol}' is not allowed`);
    }

    const hostname = parsed.hostname.toLowerCase();

    if (this.BLOCKED_HOSTS.has(hostname)) {
      throw new BadRequestException(`Access to restricted internal host [${hostname}] is blocked (SSRF Protection)`);
    }

    if (net.isIP(hostname) && this.isPrivateIp(hostname)) {
      throw new BadRequestException(`Access to private IP address [${hostname}] is blocked (SSRF Protection)`);
    }

    return parsed;
  }
}
