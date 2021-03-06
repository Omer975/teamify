package se.kth.sda.wellbean.task;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import se.kth.sda.wellbean.auth.AuthService;
import se.kth.sda.wellbean.category.Category;
import se.kth.sda.wellbean.category.CategoryService;
import se.kth.sda.wellbean.project.Project;
import se.kth.sda.wellbean.project.ProjectChanged;
import se.kth.sda.wellbean.project.ProjectService;
import se.kth.sda.wellbean.user.User;
import se.kth.sda.wellbean.user.UserService;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;
    private final AuthService authService;
    private final UserService userService;
    private final CategoryService categoryService;
    private final ProjectService projectService;
    private final ApplicationEventPublisher publisher;

    public TaskController(TaskService taskService,
                          AuthService authService,
                          UserService userService,
                          CategoryService categoryService,
                          ProjectService projectService,
                          ApplicationEventPublisher publisher) {
        this.taskService = taskService;
        this.authService = authService;
        this.userService = userService;
        this.categoryService = categoryService;
        this.projectService = projectService;
        this.publisher = publisher;
    }

    /**
     *
     * Returns all tasks
     * @return List of all tasks
     *
     *
     */
    @GetMapping("")
    public List<Task> getAllTask() {
        //TODO if current user has access to tasks
        return taskService.getAllListTask();
    }

    /**
     * Returns all tasks related to specific project with Id. If user has not have
     * access to project method throws method not allowed exception
     * Example of usage:
     * localhost:8080/tasks/projectId?projectId=1 - returns all the task
     * with projectId = 1
     * @param projectId
     * @return List of tasks with specific projectId
     * @throws ResponseStatusException
     */
    @GetMapping("/projectId")
    public List<Task> gelAllTaskByProjectId(@RequestParam Long projectId) {
        //if current user has access to tasks
        if (checkCredentialsByProjectId(projectId)) {
            return taskService.gelAllTaskByProjectId(projectId);
        }
        else
        {
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED);
        }
    }

    /**
     * Returns all tasks related to specific category. If user has not have
     * access to category method throws method not allowed exception
     * Example of usage:
     * localhost:8080/tasks/categoryId?categoryId=1 - returns all the task
     * with category  ID = 1
     * @param categoryId
     * @return List of tasks with specific category id
     * @throws ResponseStatusException
     */
    @GetMapping("/categoryId")
    public List<Task> getAllTaskByCategoryId(@RequestParam Long categoryId) {
        // if current user has access to tasks
        if (checkCredentialsByCategoryId(categoryId)) {
            return taskService.getAllTaskByCategoryId(categoryId);
        }
        else {
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED);
        }
    }

    /**
     * Returns all tasks created by specific user id for specific project. If user doesn't exist
     * method throws not found exception. If current user has no access for projcet -
     * method throws method not allowed exception
     * Example of usage:
     * localhost:8080/tasks/memberProject?memberId=1&projectId=1- returns the all tasks related
     * to the user with the ID = 1 and project = 1
     * @param memberId
     * @return List of tasks with specific member id
     * @throws ResponseStatusException
     */
    @GetMapping("/memberProject")
    public List<Task> getAllTaskByMemberIdAndProjectId(@RequestParam Long memberId, @RequestParam Long projectId) {
        if (checkCredentialsByProjectId(projectId)) {
            if (memberId != null) {
                return taskService.findAllByProjectIdIdAndMembers_Id(projectId, memberId);
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND);
            }
        }
        else {
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED);
        }
    }

    /**
     * Returns all task with specific category AND specific user id. If user or category
     * tegory doesn't exist
     * method throw not found exception
     * Example of usage:
     * localhost:8080/tasks/categoryMember?categoryId=1&memberId=1 - returns the all tasks related
     * to the user with the ID = 1
     * @param memberId, categoryId
     * @return List of tasks with specific member id
     * @throws ResponseStatusException
     */
    @GetMapping("/categoryMember")
    public List<Task> getAllTaskByMemberIdAndCategoryId( @RequestParam Long categoryId, @RequestParam Long memberId) {
        //if current user has access to tasks
        if (checkCredentialsByCategoryId(categoryId)){
            if (memberId != null) {
                return taskService.findAllByCategoryIdAndMembers_Id(categoryId, memberId);
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND);
            }
        }
        else {
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED);
        }
    }


    /**
     * Accepts task id and returns a task that matches the id only
     * otherwise it throws not found exception
     *
     * Example of usage:
     * localhost:8080/tasks/1 - returns the task with the ID = 1
     * @param taskId
     * @return Task
     * @throws ResponseStatusException
     */

    @GetMapping("/{taskId}")
    public Task getById(@PathVariable Long taskId) {
        if (checkCredentialsByTaskId(taskId)) {
            return taskService.getById(taskId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        }
        else {
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED);
        }
    }

    /**
     Accepts a task object and id of category to which object belongs to as a parameter
     * and returns task after saving.
     *
     * Example of usage:
     * localhost:8080/tasks/1
     * @param newTask, categoryId
     * @return created Task
     * @throws ResponseStatusException
     */

    @PostMapping("/{categoryId}")
    public Task create(@PathVariable Long categoryId, @RequestBody Task newTask){
        if (checkCredentialsByCategoryId(categoryId)) {
            Category newCategory = categoryService.getById(categoryId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            Project project = newCategory.getProject();
            newTask.setProject(project);
            newTask.setCategory(newCategory);
            taskService.create(newTask);
            this.publisher.publishEvent(new ProjectChanged(project));
            return newTask;
        }
        else {
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED);
        }
    }

    /**
     Accepts a task object and id of category to which object belongs to as a parameter
     * and returns task after saving.
     *
     * Example of usage:
     * localhost:8080/tasks/1 - updates task (see id of the task in body) with category  Id = 1
     * @param updatedTask, categoryId
     * @throws ResponseStatusException
     * @return created Task
     */
    @PutMapping("/{categoryId}")
    public Task update(@PathVariable Long categoryId, @RequestBody Task updatedTask)
    {
        if (checkCredentialsByCategoryId(categoryId)) {
            Category newCategory = categoryService.getById(categoryId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            updatedTask.setCategory(newCategory);
            Project project = newCategory.getProject();
            updatedTask.setProject(project);
            Task taskFromDb = taskService.getById(updatedTask.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            updatedTask.setMembers(taskFromDb.getMembers());
            updatedTask.setComments(taskFromDb.getComments());
            taskService.create(updatedTask);
            this.publisher.publishEvent(new ProjectChanged(project));
            return updatedTask;
        }
        else {
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED);
        }
    }

    /**
     * Accepts a task and specific user id
     * to add particular user the member list of the task with id = 1
     *  localhost:8080/tasks/1/userId?userId=1
     * @param taskId, userId
     * @throws ResponseStatusException
     * @return updated task
     *
     */

    @PutMapping("/{taskId}/userId")
    public Task update(@PathVariable Long taskId, @RequestParam Long userId)
    {
        if (checkCredentialsByTaskId(taskId)) {
            Task updatedTask = taskService.getById(taskId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            User newMember = userService.findById(userId);
            if (newMember != null) {
                //TODO member should belong to project!
                updatedTask.addMember(newMember);
                taskService.update(updatedTask);
                Project project = updatedTask.getProject();
                this.publisher.publishEvent(new ProjectChanged(project));
                return updatedTask;
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND);
            }
        }
        else {
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED);
        }
    }

    /**
     * Accepts a task and specific task id and move it to specific category ID
     *
     *  localhost:8080/tasks/2/newCategoryId?newCategoryId=3
     * @param taskId, categoryId
     * @throws ResponseStatusException
     * @return updated task
     *
     */

    @PutMapping("/{taskId}/newCategoryId")
    public Task updateCategory(@PathVariable Long taskId, @RequestParam Long newCategoryId)
    {
        if (checkCredentialsByTaskId(taskId) && checkCredentialsByCategoryId(newCategoryId)) {
            Task updatedTask = taskService.getById(taskId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            Category newCat = categoryService.getById(newCategoryId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

            updatedTask.setCategory(newCat);
            taskService.update(updatedTask);
            Project project = updatedTask.getProject();
            this.publisher.publishEvent(new ProjectChanged(project));
            return updatedTask;
            }
        else {
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED);
        }
    }

    /**
     * Delete member from the task with the given id
     * and return updated task
     * localhost:8080/tasks/1/remove/userId?userId=1
     * @param taskId, userId
     * @throws ResponseStatusException
     * @return updated task
     */
    @PutMapping("{taskId}/remove/userId")
    public Task delete(@PathVariable Long taskId, @RequestParam Long userId){
        if (checkCredentialsByTaskId(taskId)) {
            Task updatedTask = taskService.getById(taskId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            User memberToBeDeleted = userService.findById(userId);
            if (memberToBeDeleted != null) {
                updatedTask.removeMember(memberToBeDeleted);
                taskService.update(updatedTask);
                Project project = updatedTask.getProject();
                this.publisher.publishEvent(new ProjectChanged(project));
                return updatedTask;
            } else {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND);
            }
        }
        else {
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED);
        }
    }

    /**
     * Deletes the task with the given id
     * Example of usage:
     * localhost:8080/tasks/1 - deletes the task with the ID = 1
     * @param taskId
     * @throws ResponseStatusException
     */
    @DeleteMapping("/{taskId}")
    public Long delete(@PathVariable Long taskId){
        if (checkCredentialsByTaskId(taskId)) {
            Task task = taskService.getById(taskId).
                    orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            Project project = task.getProject();
            System.out.println("Project to update:" + project.toString());
            this.publisher.publishEvent(new ProjectChanged(project));
            System.out.println("Event published");
            taskService.delete(taskId);
            return taskId;
        }
        else {
            throw new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED);
        }
    }

    private User getCurrentUser() {
        return userService.findUserByEmail(authService.getLoggedInUserEmail());
    }

    private boolean checkCredentialsByProjectId(Long projectId) {
        return projectId != null && projectService.getById(projectId).getUsers().contains(getCurrentUser());
    }

    private boolean checkCredentialsByCategoryId(Long categoryId) {
        if (categoryId != null) {
            Category currentCategory = categoryService.getById(categoryId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
            return checkCredentialsByProjectId(currentCategory.getProject().getId());
        }
        else {
            return false;
        }
    }

    private boolean checkCredentialsByTaskId (Long taskId)
    {
        Task currentTask = taskService.getById(taskId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Long currentProjectId = currentTask.getProject().getId();
        return projectService.getById(currentProjectId).getUsers().contains(getCurrentUser());
    }

    private List<Project> getAllAvailableProjectsForCurrentUser()
    {
        List<Project> allProjects =  projectService.getAll();
        List<Project> availableProjects = new ArrayList<>();

        for (Project prj: allProjects)
        {
            Set<User> allUsers = prj.getUsers();
            if (allUsers.contains(getCurrentUser())){
                availableProjects.add(prj);
            }
        }
        return availableProjects;
    }


}

