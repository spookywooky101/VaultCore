package com.personal.cms.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    @Bean
    public JwtAuthenticationFilter authenticationJwtTokenFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins:http://localhost:5173}")
    private String allowedOriginsProp;

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        return request -> {
            String origin = request.getHeader("Origin");
            org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
            
            // Dynamically allow the origin if it is localhost or a Vercel deployment
            if (origin != null && (origin.contains("localhost") || origin.contains("127.0.0.1") || origin.endsWith(".vercel.app") || origin.endsWith("vercel.app"))) {
                configuration.setAllowedOrigins(java.util.List.of(origin));
            } else {
                // Fallback to configured origins from properties
                java.util.List<String> origins = java.util.stream.Stream.of(allowedOriginsProp.split(","))
                        .map(String::trim)
                        .collect(java.util.stream.Collectors.toList());
                configuration.setAllowedOrigins(origins);
            }
            
            configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
            configuration.setAllowedHeaders(java.util.List.of("Authorization", "Cache-Control", "Content-Type"));
            configuration.setExposedHeaders(java.util.List.of("Authorization"));
            configuration.setAllowCredentials(true);
            return configuration;
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> 
                auth.requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/h2-console/**").permitAll()
                    .anyRequest().authenticated()
            );
        
        // Allow frames for H2 Console
        http.headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()));

        http.authenticationProvider(authenticationProvider());

        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
