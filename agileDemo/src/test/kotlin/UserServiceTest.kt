package com.mongodb.agileDemo.service

import com.mongodb.agileDemo.model.User
import com.mongodb.agileDemo.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.junit.jupiter.SpringExtension

@SpringBootTest
class UserServiceTest @Autowired constructor(
    private val userService: UserService,
    private val userRepository: UserRepository
) {

    @Test
    fun `test createUser`() {
        val email = "john.doe@example.com"
        if (userService.existsByEmail(email)) {
            userService.deleteUserByEmail(email)
        }
        val user = userService.createUser("John Doe", email)
        println("User object: $user")
        assertNotNull(user.id)
        assertEquals("John Doe", user.name)
        assertEquals(email, user.email)
    }

    
    @Test
    fun `test getUserByEmail`() {
        val email = "jane.doe@example.com"
        if (userService.existsByEmail(email)) {
            userService.deleteUserByEmail(email)
        }
        userService.createUser("Jane Doe", email)
        val user = userService.getUserByEmail(email)
        assertNotNull(user)
        assertEquals("Jane Doe", user?.name)
    }
/* 
    @Test
    fun `test getAllUsers`() {
        userService.createUser("User1", "user1@example.com")
        userService.createUser("User2", "user2@example.com")
        val users = userService.getAllUsers()
        assertEquals(2, users.size)
    }
    */
}