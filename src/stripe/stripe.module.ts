import { DynamicModule, Module, Provider } from '@nestjs/common';
import { Stripe } from 'stripe';
import { StripeController } from './stripe.controller';
import { StripeRepository } from './stripe.repository';
import { StripeService } from './stripe.service';

@Module({})
export class StripeModule {
  static forRoot(apiKey: string, config: Stripe.StripeConfig): DynamicModule {
    const stripe = new Stripe(apiKey, config);
    const stripeProvider: Provider = {
      provide: 'STRIPE_CLIENT',
      useValue: stripe,
    };
    return {
      module: StripeModule,
      controllers: [StripeController],
      providers: [stripeProvider, StripeService, StripeRepository],
      exports: [stripeProvider, StripeService],
      global: true,
    };
  }
}
