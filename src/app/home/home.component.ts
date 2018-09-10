import { Component, OnInit, HostListener  } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { AppService } from "./../app.service";
import { SocketService } from './../socket.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
// import * as ts from "./../../../node_modules/typescript";


@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css'],
    providers: [SocketService]  //very important line if not included socket code will not hit for first time.
})
export class HomeComponent implements OnInit {

    //initializing p to one
    p: number = 1;
    public filter: any;
    public peopleSearch:any;
    //sorting
    key: string = 'createdOn';
    reverse: boolean = false;
    sort(key) {
        this.key = key;
        this.reverse = !this.reverse;
    }

    // user related variables
    public users: any;
    public userId: string;
    public userInfo: any;

    // pagination variable
    public currentPage: any;
    public pageSize: any = 10;
    public length: any;

    // socketservice varialbes
    public authToken: string;
    public userList: any = [];
    public disconnectedSocket: boolean;

    // task variables
    public private: boolean = false;
    public title: any;
    public spinner: boolean = false;
    public taskCreationUpdate: boolean = false;
    public tasks: any;
    public editMode: boolean = false;
    public taskId: string;
    public undoData: any;
    public taskDetailsToEdit:any;
    // public show: boolean = false;
    public step = 0;
    // nested form related variable
    public count: number = 1;
    taskNumberIds: number[] = [1];
    public taskDetailsObj: any;
    public taskList: string[];
    public subtask1: any;
    public subtask2: any;
    public subtask3: any;
    public subtask4: any;
    public subtask5: any;
    public subtask6: any;
    public subtask7: any;
    public subtask8: any;
    public subtask9: any;
    public subtask10: any;





    constructor(public SocketService: SocketService, public snackBar: MatSnackBar, public router: Router, public _route: ActivatedRoute, public appService: AppService) { }
   
    //checking for keypress to undo
    @HostListener('window:keyup', ['$event'])

    handleKeyboardEvent(event: KeyboardEvent) {
        if(event.getModifierState && event.getModifierState('Control') && event.keyCode===90){
            
            this.undo();

        }
      }


    ngOnInit() {
        console.log('NG onit was called :');
        this.authToken = Cookie.get('authtoken');

        this.userId = this.appService.getUserInfoFromLocalstorage().userId;

        this.checkStatus();

        this.verifyUserConfirmation();

        this.getOnlineUserList();

        this.createVariable();

        this.getNotify();

        
        this.getUserDetails(this.userId);
        
        this.getAllTasks()
        
        setTimeout(() => {
            this.getALLUsers();
        }, 4000);


    }


    //undo button
    // Get all users
    undo() {

        this.appService.undo().subscribe(
            (data) => {

                this.undoData = data
                console.log(this.undoData);

                if (this.undoData.status == 200) {
                    this.getAllTasks();

                    this.snackBar.open(`${this.undoData.message}`, "Dismiss", {
                        duration: 2000,
                    });

                } else if (this.undoData.status == 404) {

                    this.snackBar.open(`${this.undoData.message}`, "Dismiss", {
                        duration: 2000,
                    });
                } else {

                    this.snackBar.open(`Some Error occured`, "Dismiss", {
                        duration: 2000,
                    });
                }
            }, (err) => {

                this.snackBar.open(`some error occured`, "Dismiss", {
                    duration: 5000,
                });

            });

    }//end of get all users

    // create variable for task details
    createVariable() {

        for (var i = 0; i <= 9; i++) {
            for (var j = 1; j <= 5; j++) {

                this[`detail${i}${j}`]

            }
        }
    }

    // check to for validity
    public checkStatus: any = () => {

        if (Cookie.get('authtoken') === undefined || Cookie.get('authtoken') === '' || Cookie.get('authtoken') === null) {

            this.router.navigate(['/']);

            return false;

        } else {

            return true;

        }

    } // end checkStatus



    public verifyUserConfirmation: any = () => {

        this.SocketService.verifyUser()
            .subscribe((data) => {

                this.disconnectedSocket = false;

                this.SocketService.setUser(this.authToken);

            });
    }


    public getOnlineUserList: any = () => {

        this.SocketService.onlineUserList()
            .subscribe((userList) => {

                this.userList = [];

                for (let x in userList) {

                    let temp = { 'userId': userList[x].userId, 'name': userList[x].fullName };

                    this.userList.push(temp);

                }
                console.log('UserList =>', this.userList);

            }); // end online-user-list
    }



    // Get all users
    getALLUsers() {

        this.appService.getAllUsers().subscribe(
            data => {
                this.users = data['data'];
            }
        )

    }//end of get all users

    // get detail of current user
    getUserDetails(id) {

        this.appService.getUserInfo(id).subscribe(
            data => {
                this.userInfo = data['data'];
                setTimeout(() => {
                    this.appService.setUserInfoInLocalStorage(this.userInfo);
                }, 2000);

            }
        )

    }

    addAsFriend(id, name) {

        // send friends request
        this.appService.request(this.userId, id).subscribe((apiResponse) => {

            if (apiResponse.status === 200) {

                this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
                    duration: 5000,
                });

                // sending notification
                let notifyObject = {
                    senderName: this.userInfo.firstName,
                    senderId: this.userId,
                    receiverName: name,
                    receiverId: id,
                    message: `${this.userInfo.firstName} has sent you friend's request`,
                    createdOn: new Date()
                }

                this.SocketService.sendNotify(notifyObject);

            } else {

                this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
                    duration: 5000,
                });

            }

        }, (err) => {

            this.snackBar.open(`some error occured`, "Dismiss", {
                duration: 5000,
            });

        });


        // add user to pending or requested array
        this.appService.requested(this.userId, id).subscribe((apiResponse) => {

            if (apiResponse.status === 200) {

                this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
                    duration: 5000,
                });


            } else {

                this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
                    duration: 5000,
                });

            }

        }, (err) => {

            this.snackBar.open(`some error occured`, "Dismiss", {
                duration: 5000,
            });

        });

        // refreshing
        setTimeout(() => {
            this.ngOnInit();
        }, 1000);
    }



    // Add request user to friends array
    addToFriend(id, name) {

        // add friend to friends array
        this.appService.addAsFriend(id, this.userId).subscribe((apiResponse) => {

            if (apiResponse.status === 200) {

                this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
                    duration: 5000,
                });
                // sending notification
                let notifyObject = {
                    senderName: this.userInfo.firstName,
                    senderId: this.userId,
                    receiverName: name,
                    receiverId: id,
                    message: `${this.userInfo.firstName} has accepted your friend's request`,
                    createdOn: new Date()
                }

                this.SocketService.sendNotify(notifyObject)

            } else {

                this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
                    duration: 5000,
                });

            }

        }, (err) => {

            this.snackBar.open(`some error occured`, "Dismiss", {
                duration: 5000,
            });

        });


        // refreshing
        setTimeout(() => {
            this.ngOnInit();
        }, 1000);
    }


    public getNotify: any = () => {

        this.SocketService.notify(this.userId)
            .subscribe((data) => {

                let message = data;

                this.snackBar.open(`${message.message}`, "Dismiss", {
                    duration: 5000,
                });

                this.getAllTasks();
                this.getALLUsers();
                this.getUserDetails(this.userId);
            });//end subscribe

    }// end get message from a user 


    ///////////////////////////////////////Task related code///////////////////////////////////

    // get all tasks
    public getAllTasks: any = () => {
        this.appService.getAllTasks().subscribe(
            data => {
                this.tasks = data['data'];
                this.length = data['status'];

            }

        )

    }


    //create a task function
    public addTask: any = () => {
        this.taskList = [];

        if (this.title) {
            this.spinner = true;


            let taskObj = {
                taskId: '',
                title: this.title,
                type: '',
                tasks: [],
                createdByUserId: this.userId,
                createdBy: this.userInfo.firstName,
                modifiedBy: this.userInfo.firstName,
                modifiedOn: Date.now(),
            }

            // handling private or public task
            if (this.private == true) {
                taskObj.type = 'private'
            } else {
                taskObj.type = 'public'
            }



            // Mapping all the NgModels to TaskObj to send them to backend
            for (let i = 1; i <= 10; i++) {

                if (this[`subtask${i}`]) {

                    let taskDetailsObj = {
                        task: this[`subtask${i}`],
                        status: `pending`,
                        subtask: []
                    }

                    for (let j = 1; j <= 5; j++) {

                        if (this[`detail${i - 1}${j}`]) {

                            taskDetailsObj.subtask.push(this[`detail${i - 1}${j}`]);

                        }
                    }

                    taskObj.tasks.push(taskDetailsObj)
                }
            }



            if (this.editMode === false) {
                //If edit mode is false the create task
                this.appService.createTask(taskObj).subscribe(
                    apiResponse => {

                        if (apiResponse.status === 200) {

                            this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
                                duration: 2000,
                            });

                            this.spinner = false;
                            this.taskCreationUpdate = true;

                            window.location.reload()

                        } else {

                            this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
                                duration: 5000,
                            });

                        }

                    }, (err) => {

                        this.snackBar.open(`some error occured`, "Dismiss", {
                            duration: 5000,
                        });

                    });//end of create task


            } else {

                taskObj.taskId = this.taskId;
                taskObj.modifiedBy = this.userInfo.firstName;
                //If edit mode is true then edit task
                this.appService.editTask(taskObj).subscribe((apiResponse) => {
                    if (apiResponse.status === 200) {

                        this.snackBar.open(`Task Edited!`, "Dismiss", {
                            duration: 5000,
                        });

                        this.spinner = false;
                        this.taskCreationUpdate = true;

                        if (this.userId !== taskObj.createdByUserId) {

                            // sending notification
                            let notifyObject = {
                                senderName: this.userInfo.firstName,
                                senderId: this.userId,
                                receiverName: taskObj.createdBy,
                                receiverId: taskObj.createdByUserId,
                                message: `${this.userInfo.firstName} has Edited task list you created.`,
                                createdOn: Date.now()
                            }

                            this.SocketService.sendNotify(notifyObject);


                        }
                        setTimeout(() => {
                            window.location.reload()
                        }, 1000);

                    } else {

                        this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
                            duration: 5000,
                        });

                    }

                }, (err) => {

                    this.snackBar.open(`some error occured`, "Dismiss", {
                        duration: 5000,
                    });

                });


            }//end of edit task

        } else {
            this.snackBar.open(`Please enter title`, "Dismiss", {
                duration: 2000,

            });

        }

    }

    // nested form
    remove(i: number) {
        this.count--
    }

    add() {
        this.taskNumberIds.push(++this.count);
    }


    taskChecked(task, i) {

        let taskObj = task;
        taskObj.modifiedBy = this.userInfo.firstName;
        taskObj.modifiedOn = Date.now();
        setTimeout(() => {

            task.tasks.splice(i, 1)
            console.log(taskObj);

            this.appService.editTask(taskObj).subscribe((apiResponse) => {
                if (apiResponse.status === 200) {

                    this.snackBar.open(`Task Completed!`, "Dismiss", {
                        duration: 5000,
                    });

                    if (this.userId !== taskObj.createdByUserId) {

                        // sending notification
                        let notifyObject = {
                            senderName: this.userInfo.firstName,
                            senderId: this.userId,
                            receiverName: taskObj.createdBy,
                            receiverId: taskObj.createdByUserId,
                            message: `${this.userInfo.firstName} has Edited task list you created.`,
                            createdOn: Date.now()
                        }

                        this.SocketService.sendNotify(notifyObject);

                        // refreshing
                        this.getAllTasks();
                    }

                } else {

                    this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
                        duration: 5000,
                    });

                }

            }, (err) => {

                this.snackBar.open(`some error occured`, "Dismiss", {
                    duration: 5000,
                });

            });


        }, 500);

    }

    //function for pre render value to form for editing values
    editValue(task) {

        // setting this variable for passing to delete task function
        this.taskDetailsToEdit = task;

        this.editMode = true;

        this.clear();

        this.title = task.title;
        this.taskId = task.taskId
        if (task.type == 'private') {
            this.private = true
        } else {
            this.private = false;
        }

        let i = 1
        task.tasks.map(x => {

            this[`subtask${i}`] = x.task
            i++
        })

    }

    subtaskChecked(task, i, j) {

        let taskObj = task;
        taskObj.modifiedBy = this.userInfo.firstName;
        taskObj.modifiedOn = Date.now();
        task.tasks[i].subtask.splice(j, 1)
        console.log(taskObj);

        this.appService.editTask(taskObj).subscribe((apiResponse) => {
            if (apiResponse.status === 200) {

                this.snackBar.open(`SubTask Completed!`, "Dismiss", {
                    duration: 5000,
                });

                if (this.userId !== taskObj.createdByUserId) {

                    // sending notification
                    let notifyObject = {
                        senderName: this.userInfo.firstName,
                        senderId: this.userId,
                        receiverName: taskObj.createdBy,
                        receiverId: taskObj.createdByUserId,
                        message: `${this.userInfo.firstName} has Edited ${taskObj.title} tasklist .`,
                        createdOn: Date.now()
                    }

                    this.SocketService.sendNotify(notifyObject);

                     // refreshing
                    this.getAllTasks();
                }

            } else {

                this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
                    duration: 5000,
                });

            }

        }, (err) => {

            this.snackBar.open(`some error occured`, "Dismiss", {
                duration: 5000,
            });

        });

    }

    deleteTask() {

        let taskObj = this.taskDetailsToEdit;
        taskObj.modifiedBy = this.userInfo.firstName;
        taskObj.modifiedOn = Date.now();
        console.log(taskObj);
        
        this.appService.deleteTask(taskObj).subscribe((apiResponse) => {
            if (apiResponse.status === 200) {

                this.snackBar.open(`Task Deleted!`, "Dismiss", {
                    duration: 5000,
                });

                if (this.userId !== taskObj.createdByUserId) {

                    // sending notification
                    let notifyObject = {
                        senderName: this.userInfo.firstName,
                        senderId: this.userId,
                        receiverName: taskObj.createdBy,
                        receiverId: taskObj.createdByUserId,
                        message: `${this.userInfo.firstName} has Deleted ${taskObj.title} tasklist.`,
                        createdOn: Date.now()
                    }

                    this.SocketService.sendNotify(notifyObject);

                     // refreshing
                    this.getAllTasks();
                }

            } else {

                this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
                    duration: 5000,
                });

            }

        }, (err) => {

            this.snackBar.open(`some error occured`, "Dismiss", {
                duration: 5000,
            });

        });

    }
    
    ////////////////////////////////add details/////////////////////////////////


    editModeOff() {
        this.editMode = false;
    }


    clear() {

        this.private = false;
        this.title = '';
        this.count = 1;
        this.taskNumberIds = [1];

        for (var i = 1; i <= 10; i++) {
            this[`subtask${i}`] = '';
        }

        for (var i = 0; i <= 9; i++) {
            for (var j = 1; j <= 5; j++) {

                this[`detail${i}${j}`] = '';

            }
        }

    }

    setStep(index: number) {
        this.step = index;
    }

    nextStep() {
        this.step++;
    }

    prevStep() {
        this.step--;
    }

   
    // logout Function
    public logout: any = () => {
    
        let userId = this.appService.getUserInfoFromLocalstorage().userId
    
        this.appService.logout(userId)
          .subscribe((apiResponse) => {
    
            if (apiResponse.status === 200) {
    
              Cookie.delete('authtoken');
    
              this.SocketService.exitSocket();
    
              this.router.navigate(['/sign-in']);
    
            } else {
              this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
                duration: 5000,
              });
    
            } // end condition
    
          }, (err) => {
            this.snackBar.open(`some error occured`, "Dismiss", {
              duration: 5000,
            });
    
    
          });
    
      } // end logout
}