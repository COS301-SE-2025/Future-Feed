package com.syntexsquad.futurefeed.model;

import jakarta.persistence.*;


@Entity
@Table(name = "bookmarks")
public class Bookmark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private AppUser user;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;

    // Constructors
    public Bookmark() {}

    public Bookmark(AppUser user, Post post) {
        this.user = user;
        this.post = post;
    }

    // Getters and setters
    public Long getId() { return id; }

    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }

    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }
}
