package com.syntexsquad.futurefeed;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.context.annotation.Bean;
//import org.springframework.web.servlet.config.annotation.CorsRegistry;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class FuturefeedApplication {

	public static void main(String[] args) {
		SpringApplication.run(FuturefeedApplication.class, args);
	}

	/*@Bean
	public WebMvcConfigurer corsConfigurer(){
		return new WebMvcConfifurer(){
			@Override
			public void addCorsMappings(CorsRegistry registry){
				registry.addMapping("/api/**")
						.allowedOrigins("http:localhost:5173")
						.allowedMethods("GET", "POST", "DELETE", "PUT")
						.allowedHeaders("*");
				
			}
		};
	}*/
}
