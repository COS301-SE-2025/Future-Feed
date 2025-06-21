package com.syntexsquad.futurefeed.model;
import com.syntexsquad.futurefeed.model.AppUser;
@Entity
public class FeedPreset {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private boolean isDefault;

    @ManyToOne
    private AppUser owner;

    @OneToMany(mappedBy = "feedPreset", cascade = CascadeType.ALL)
    private List<FeedRule> rules;
}
