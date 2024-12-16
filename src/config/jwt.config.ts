import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => {
    const secret = process.env.JWT_SECRET;
    return { secret };
});