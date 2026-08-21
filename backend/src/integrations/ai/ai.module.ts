import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiGatewayService } from './ai-gateway.service';
import { OpenAiProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { AnthropicProvider } from './providers/anthropic.provider';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    OpenAiProvider,
    GeminiProvider,
    AnthropicProvider,
    AiGatewayService,
  ],
  exports: [AiGatewayService],
})
export class AiModule {}
