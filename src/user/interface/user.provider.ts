import { CacheService } from '@cache/cache.service'
import {
  IPASSWORD_HASHER,
  IUSER_REPOSITORY,
  IUSER_SERVICE,
  IEMAIL_SERVICE,
  IAUTH_SERVICE,
  ITOKEN_SERVICE,
  ICACHE_SERVICE,
} from '@common/constants/provider.constant'
import { PasswordHasher } from '@common/passwordHasher'
import { UserService } from '@user/app/user.service'
import { UserRepository } from '@user/infra/userRepository'
import { EmailService } from '@user/infra/adapter/email.service'
import { AuthService } from '@auth/app/auth.service'
import { TokenService } from '@auth/infra/token.sevice'

export const UserProvider = [
  {
    provide: IUSER_REPOSITORY, //고유한 키
    useClass: UserRepository,
  },
  {
    provide: IUSER_SERVICE,
    useClass: UserService,
  },
  {
    provide: IPASSWORD_HASHER,
    useClass: PasswordHasher,
  },
  { provide: IEMAIL_SERVICE, useClass: EmailService },
]
