import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  //   @Post('/create-subscription')
  //   async createSubscription(
  //     @Body() createSubscriptionDto: CreateSubscriptionDto,
  //   ): Promise<Subscription> {
  //     return this.usersService.createUser(
  //       createUserDto.username,
  //       createUserDto.email,
  //       createUserDto.password,
  //     );
  //   }

  @Get('/listCustomers') async listCustomers(): Promise<any> {
    return this.stripeService.listCustomers();
  }

  @Get('/listProducts') async listProducts(): Promise<any> {
    return this.stripeService.listProducts();
  }

  @Get('/findCustomerByEmail') async findCustomerByEmail(
    @Query() query: { email: string },
  ): Promise<any> {
    console.log(query);
    return this.stripeService.findCustomerByEmail(query.email);
  }

  @Post('/createSubscription') async createSubscription(
    @Body() createSubscription: CreateSubscriptionDto,
  ) {
    return this.stripeService.createSubscription(createSubscription);
  }
}
