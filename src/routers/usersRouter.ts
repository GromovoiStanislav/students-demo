import {Router, Request, Response} from 'express'

import {auth} from "../middlewares/authorization";
import {body,query} from 'express-validator';
import {paginationQuerySanitizer,inputValidation,paginationParams} from '../middlewares/input-validation'
import {UsersService,UsersQuery} from "../domain/users-services";
import {UserInputModel} from "../types/users";


const router = Router();


export const clearAllUsers = async () => {
    await UsersService.clearAll()
}


const searchSanitizer = [
    query('searchLoginTerm').escape().trim().toLowerCase().default(''),
    query('searchEmailTerm').escape().trim().toLowerCase().default(''),
]

router.get('/', paginationQuerySanitizer,searchSanitizer, async (req: Request, res: Response) => {
    const searchLoginTerm = req.query.searchLoginTerm as string
    const searchEmailTerm = req.query.searchEmailTerm as string

    const paginationParams: paginationParams = {
        pageNumber: Number(req.query.pageNumber),
        pageSize: Number(req.query.pageSize),
        sortBy: req.query.sortBy as string,
        sortDirection: req.query.sortDirection as string,
    }

    const result = await UsersQuery.getAll(searchLoginTerm,searchEmailTerm,paginationParams)
    res.send(result)
})


router.delete('/:id', auth, async (req: Request, res: Response) => {
    const result = await UsersService.deleteByID(req.params.id)
    if (result) {
        res.sendStatus(204)
    } else {
        res.sendStatus(404)
    }
})

const regex:RegExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
const validator = [
    body('login').trim().notEmpty().isString().isLength({min:3, max: 10}),
    body('password').trim().notEmpty().isString().isLength({min:6, max: 20}),
    body('email').trim().notEmpty().isEmail().matches(regex),
]

router.post('/', auth, validator, inputValidation, async (req: Request, res: Response) => {
    const data: UserInputModel = {
        login: req.body.login,
        password: req.body.password,
        email: req.body.email,
    }
    const result = await UsersService.createNewUser(data)
    res.status(201).send(result)
})


export default router