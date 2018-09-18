import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { AppService } from './../../app.service';
import { Cookie } from 'ng2-cookies/ng2-cookies'

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  public selected: '91';
  public email: string;
  public password: string;
  public firstName: string;
  public lastName: string;
  public mobileNumber: string;
  public progress: boolean = false;

  public countries: any;
  countryCode: any[] = [];

  constructor(public appService: AppService, public snackBar: MatSnackBar, public router: Router, public _route: ActivatedRoute, ) { }

  ngOnInit() {

    this.getCountries();

    //to Check if the user has been invited by someone, if so store it in cookie to add him as friend.
    let userId = this._route.snapshot.queryParams.userId

    if(userId){
      Cookie.set('inviteId', userId);
    }
   
  }



  getCountries() {
    this.appService.getAllCountry().subscribe(
      data => {

        this.countries = data
        this.countries.map(x => {
          let obj = {
            name: x.name,
            code: x.callingCodes[0]
          }
          this.countryCode.push(obj);
        });
      }
    )
  }



  step = 0;

  setStep(index: number) {
    this.step = index;
  }

  nextStep() {
    this.step++;
  }

  prevStep() {
    this.step--;
  }


  //Validations
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }

  emailFormControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  matcher = new MyErrorStateMatcher();


  submit() {

    if (!this.firstName) {
      this.snackBar.open(`enter first name`, "Dismiss", {
        duration: 5000,
      })


    } else if (!this.lastName) {
      this.snackBar.open(`enter last name`, "Dismiss", {
        duration: 5000,
      })

    } else if (!this.mobileNumber) {
      this.snackBar.open(`enter mobile`, "Dismiss", {
        duration: 5000,
      })
    } else if (!this.selected) {
      this.snackBar.open(`enter country`, "Dismiss", {
        duration: 5000,
      })

    } else if (!this.email) {
      this.snackBar.open(`enter email`, "Dismiss", {
        duration: 5000,
      })

    } else if (this.password.length < 8) {
      this.snackBar.open(`Please make sure your password is more than 8 random characters`, "Dismiss", {
        duration: 5000,
      })


    } else {
      this.progress = true;

      let data = {
        firstName: this.firstName,
        lastName: this.lastName,
        mobile: '',
        email: this.email,
        password: this.password,
      }
      data.mobile = `+${this.selected} ${this.mobileNumber}`


      this.appService.signupFunction(data)
        .subscribe((apiResponse) => {


          if (apiResponse.status === 200) {

            this.snackBar.open(`Signup Successful`, "Dismiss", {
              duration: 5000,
            })

            Cookie.set('authtoken', apiResponse.data.authToken);

            // Cookie.set('receiverId', apiResponse.data.userDetails.userId);

            // Cookie.set('receiverName', apiResponse.data.userDetails.firstName + ' ' + apiResponse.data.userDetails.lastName);

            this.appService.setUserInfoInLocalStorage(apiResponse.data.userDetails)

            this.router.navigate(['/home']);

          } else {

            this.snackBar.open(`${apiResponse.message}`, "Dismiss", {
              duration: 5000,
            })

          }

        }, (err) => {

          this.snackBar.open(`some error occured`, "Dismiss", {
            duration: 5000,
          })


        });

    } // end condition

  }

}
