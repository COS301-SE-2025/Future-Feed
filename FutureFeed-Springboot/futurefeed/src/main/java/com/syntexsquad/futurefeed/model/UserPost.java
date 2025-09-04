package com.syntexsquad.futurefeed.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@DiscriminatorValue("USER")
@Data
@EqualsAndHashCode(callSuper = true)
public class UserPost extends Post {

}

