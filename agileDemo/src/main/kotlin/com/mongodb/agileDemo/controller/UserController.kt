package com.mongodb.agileDemo.controller

import com.mongodb.agileDemo.model.User
import com.mongodb.agileDemo.service.UserService
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/users")
class UserController(private val userService: UserService) {

    @PostMapping
    fun createUser(@RequestBody user: User): User =
        userService.createUser(user.name, user.email)

    @GetMapping("/{email}")
    fun getUserByEmail(@PathVariable email: String): User? =
        userService.getUserByEmail(email)

    @GetMapping
    fun getAllUsers(): List<User> = userService.getAllUsers()
}