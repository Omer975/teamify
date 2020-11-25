package se.kth.sda.wellbean.category;

import se.kth.sda.wellbean.project.Project;
import se.kth.sda.wellbean.task.Task;

import javax.persistence.*;
import java.util.*;

@Entity
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(unique = true)
    private long id;
    @Column()
    private String title;

    @ManyToOne
    private Project project;

    @ManyToOne
    private Task task;

    public Category() {}
    public Category(long id, String title)
    {
        this.id=id;
        this.title=title;
    }

    public long getId() {
        return id;
    }
    public void setId(long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }
    public String getTitle() {
        return title;
    }

    public Project getProject() {
        return project;
    }
    public void setProject(Project project) {
        this.project = project;
    }

    public Task getTask() {
        return task;
    }

    public void setTask(Task task) {
        this.task = task;
    }
}