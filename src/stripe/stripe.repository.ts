import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import Stripe from 'stripe';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class StripeRepository {
  constructor(@Inject('STRIPE_CLIENT') private stripe: Stripe) {}

  async listCustomers() {
    return this.stripe.customers.list();
  }

  async listProducts() {
    return this.stripe.products.list();
  }

  async findCustomerByEmail(email: string): Promise<any> {
    return this.stripe.customers.search({
      query: `email:'${email}'`,
      expand: ['data.subscriptions'],
    });
  }

  async createSubscription(createSubscriptionRequest: CreateSubscriptionDto) {
    // create a stripe customer
    const customer = await this.findCustomerByEmail(
      createSubscriptionRequest.email,
    );
    // check if customer already has an open subscription
    if (customer.data.length === 0) {
      const customer = await this.stripe.customers.create({
        name: createSubscriptionRequest.name,
        email: createSubscriptionRequest.email,
        payment_method: createSubscriptionRequest.paymentMethod,
        invoice_settings: {
          default_payment_method: createSubscriptionRequest.paymentMethod,
        },
      });

      // get the price id from the front-end
      const priceId = createSubscriptionRequest.priceId;

      // create a stripe subscription
      const subscription = await this.stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: priceId }],
        payment_settings: {
          payment_method_options: {
            card: {
              request_three_d_secure: 'any',
            },
          },
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });
      const invoice = subscription.latest_invoice as Stripe.Invoice;

      if (invoice.payment_intent) {
        const intent = invoice.payment_intent as Stripe.PaymentIntent;
        // return the client secret and subscription id
        return {
          clientSecret: intent.client_secret,
          subscriptionId: subscription.id,
        };
      }
    } else {
      throw new Error('Customer already has an open subscription');
    }
  }
}
