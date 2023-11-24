import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common'
import { ReqBudgetDto } from '@budget/domain/dto/budget.app.dto'
import { IBUDGET_SERVICE } from '@common/constants/provider.constant'
import { IBudgetService } from '@budget/domain/interface/budget.service.interface'
import { IBUDGET_REPOSITORY } from '@common/constants/provider.constant'
import { IBudgetRepository } from '@budget/domain/interface/budget.repository.interface'
import { plainToClass } from 'class-transformer'
import { UUID } from 'crypto'
import {
  BUDGET_ALREADY_EXIST,
  BUDGET_NOTFOUND,
} from '@common/messages/budget/budget.error'

@Injectable()
export class BudgetService implements IBudgetService {
  constructor(
    @Inject(IBUDGET_REPOSITORY)
    private readonly budgetRepository: IBudgetRepository,
  ) {}

  async createBudget(req: ReqBudgetDto): Promise<string> {
    try {
      const yearMonth = new Date(req.month) // month는 문자열

      const existingBudget = await this.budgetRepository.findSameBudget(
        yearMonth,
        req.userId,
      )
      console.log(existingBudget)
      // 해당 달에 이미 예산이 있는지 확인
      if (Object.keys(existingBudget).length > 0) {
        throw new ConflictException(BUDGET_ALREADY_EXIST)
      } else {
        // Promise.all을 사용하여 모든 프로미스를 병렬로 해결
        await Promise.all(
          Object.entries(req.amount).map(async ([classification, budget]) => {
            await this.budgetRepository.createBudget(
              req.userId,
              yearMonth,
              Number(classification),
              budget,
            )
          }),
        )
        return '예산 설정에 성공하였습니다.'
      }
    } catch (error) {
      console.log(error)
      if (error instanceof ConflictException) {
        throw error
      } else {
        throw new InternalServerErrorException('예산 설정에 실패했습니다.')
      }
    }
  }

  async updateBudget(req: ReqBudgetDto): Promise<string> {
    try {
      const yearMonth = new Date(req.month)
      const existingBudget = await this.budgetRepository.findSameBudget(
        yearMonth,
        req.userId,
      )
      // console.log(existingBudget)
      // 해당 달에 이미 예산이 있는지 확인
      if (Object.keys(existingBudget).length > 0) {
        await Promise.all(
          Object.entries(req.amount).map(async ([classification, budget]) => {
            await this.budgetRepository.updateBudget(
              req.userId,
              yearMonth,
              Number(classification),
              budget,
            )
          }),
        )
        return '예산 변경에 성공하였습니다.'
      } else {
        throw new NotFoundException(BUDGET_NOTFOUND)
      }
    } catch (error) {
      // console.log(error)
      if (error instanceof NotFoundException) {
        throw error
      } else {
        throw new InternalServerErrorException('예산 변경에 실패했습니다.')
      }
    }
  }
}
