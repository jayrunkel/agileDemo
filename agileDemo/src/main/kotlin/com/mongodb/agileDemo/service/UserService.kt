package com.mongodb.agileDemo.service

import com.mongodb.agileDemo.model.User
import com.mongodb.agileDemo.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.beans.factory.annotation.Autowired

@Service
class UserService() {

    @Autowired
    private lateinit var userRepository: UserRepository

    fun createUser(name: String, email: String): User {
        if (userRepository.existsByEmail(email)) {
            throw IllegalArgumentException("[UserService.createUser] User with email $email already exists")
        }
        if (name.isBlank() || email.isBlank()) {
            throw IllegalArgumentException("[UserService.createUser] Name and email cannot be blank")
        }
        if (!email.matches(Regex("^[A-Za-z0-9+_.-]+@(.+)$"))) {
            throw IllegalArgumentException("[UserService.createUser] Invalid email format")
        }
        val newUser = userRepository.save(User(name = name, email = email))
        println("Saved user ID: ${newUser.id}")
        return newUser
    }

    fun deleteUserByEmail(email: String) {
        
        if (userRepository.existsByEmail(email)) {
            val user = userRepository.findByEmail(email)
            userRepository.delete(user!!)
        } else {
            throw IllegalArgumentException("[UserService.deleteUserByEmail] User with email $email not found")
        }
    }    
    
    fun existsByEmail(email: String): Boolean = userRepository.existsByEmail(email)

    fun getUserByEmail(email: String): User? = userRepository.findByEmail(email)

    fun getAllUsers(): List<User> = userRepository.findAll()
}