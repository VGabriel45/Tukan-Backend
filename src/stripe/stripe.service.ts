import { Injectable } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { StripeRepository } from './stripe.repository';

@Injectable()
export class StripeService {
  constructor(private readonly stripeRepository: StripeRepository) {}

  async listCustomers() {
    return this.stripeRepository.listCustomers();
  }

  async listProducts() {
    return this.stripeRepository.listProducts();
  }

  async findCustomerByEmail(email: string) {
    return this.stripeRepository.findCustomerByEmail(email);
  }

  async createSubscription(createSubscriptionRequest: CreateSubscriptionDto) {
    return this.stripeRepository.createSubscription(createSubscriptionRequest);
  }
}
