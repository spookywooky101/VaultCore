package com.personal.cms.config;

import com.personal.cms.model.User;
import com.personal.cms.model.UserRole;
import com.personal.cms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            logger.info("Database is empty. Seeding default users (admin, editor, viewer)...");

            // Seed Admin
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("adminpassword"))
                    .role(UserRole.ROLE_ADMIN)
                    .build();
            userRepository.save(admin);
            logger.info("Seeded user 'admin' with role ROLE_ADMIN");

            // Seed Editor
            User editor = User.builder()
                    .username("editor")
                    .password(passwordEncoder.encode("editorpassword"))
                    .role(UserRole.ROLE_EDITOR)
                    .build();
            userRepository.save(editor);
            logger.info("Seeded user 'editor' with role ROLE_EDITOR");

            // Seed Viewer
            User viewer = User.builder()
                    .username("viewer")
                    .password(passwordEncoder.encode("viewerpassword"))
                    .role(UserRole.ROLE_VIEWER)
                    .build();
            userRepository.save(viewer);
            logger.info("Seeded user 'viewer' with role ROLE_VIEWER");

            logger.info("Default database seeding complete!");
        } else {
            logger.info("Database already contains users. Skipping seeding.");
        }
    }
}
