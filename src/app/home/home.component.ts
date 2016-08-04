import { Component } from '@angular/core';
import { Headers, Http, RequestOptions, URLSearchParams } from '@angular/http';


@Component({
    selector: 'zoom-home',
    templateUrl: 'app/home/home.html'
})


export class HomeComponent {
	public appLoading: boolean;
	public userLoading: boolean;
	private user_action: string;
	private API_URL: string;
	private error: string;
	private catalogs;
	private signin;
	private signup;
	private tokens;
	private credentials;

	constructor(public http: Http) {
		// IMPORTANT: These information will never store in client side or in a insecure way, it is here just like a demo
		// and to show what information and how is used
		this.API_URL = 'https://sandbox.api.zoomcatalog.com';
		this.credentials = {
			'client_id': 'zoom-api-www.onesitelogindemo',
			'client_secret': 'beefb0fa473719c26fa90eefcabda4ed'
		};
		this.appLoading = true;
		this.userLoading = false;
		this.tokens = {};
		this.signin = new User('');
		this.signup = new User('');
	}

	ngOnInit() {
		this.AuthorizeApp();
	}

	/**
	 * Method to authorize the application, just keep in mind this method manage
	 * this server calls from the server side
	 */
	AuthorizeApp() {
		this.appLoading = true;
		let api = this.API_URL + '/auth/authorize';
		let headers = new Headers({ 'Content-Type': 'application/json' });
		let options = new RequestOptions({ headers: headers });
		let params = this.credentials;
		params.grant_type = 'authorization_code';
		this.http.post(api, JSON.stringify(params), options)
			.subscribe(
				data => {
					this.tokens.access_token = data.json().access_token;
					this.appLoading = false;

					this.RandomCatalogs();
				},
				err => {
					alert('Error, see console for details');
					console.log('Error'); 
					console.log(err.json());
					this.appLoading = false;
				}
			);
	}

	/**
	 * @Note this API is not available for the One Site Login,
	 * If you are interested in having more features like getting catalogs, flyers and
	 * getting personalized flyers from your users ask to api@zoomcatalog.com
	 */
	RandomCatalogs() {
		let api = this.API_URL + '/custom/catalogs/random';
		let headers = new Headers({ 
			'Authorization': this.tokens.access_token 
		});

		let params: URLSearchParams = new URLSearchParams();
		params.set('limit', '1');

		let options = new RequestOptions({ 
			headers: headers,
			search: params
		});
		return this.http.get(api, options)
			.subscribe(
				data => { 
					this.catalogs = data.json().catalogs;
				},
				err => {
					alert('Error, see console for details')
					console.log('Error'); 
					console.log(err.json());
				}
			);
	}

	/**
	 * Method to register the user, if everything is OK the personalize url will be replaced for the one
	 * hat have the autologin method
	 */
	process() {
		this.error = '';
		this.userLoading = true;
		this.tokens.user_token = '';
		this.user_action = 'register';
		let api = this.API_URL + '/auth/register';
		let headers = new Headers({ 
			'Content-Type': 'application/json',
			'Authorization': this.tokens.access_token
		});
		let options = new RequestOptions({ headers: headers });
		let params = {};
		params['email'] = this.signup.username;

		if (!this.validateEmail(params['email']) && !this.validateMd5(params['email'])) {
			this.error = 'You must to type the email address or a MD5 string';
			this.userLoading = false;
			this.signup.username = '';
			return false;
		}

		let proc = this.http.post(api, JSON.stringify(params), options);
		proc.subscribe(
			data => {
				this.tokens.user_token = data.json()['user_token'];
				this.tokens.user = this.signup.username;
				this.signup.username = '';

				for(var i in this.catalogs) {
					this.personalize(this.catalogs[i].personalize).subscribe(
						data => {
							this.catalogs[i].personalize2 = decodeURIComponent(data.json().uri);
						});
				}
				this.userLoading = false;
			},
			err => {
				alert('Error, see console for details');
				console.log('Error'); 
				console.log(err.json());
				this.error = 'Error when try to register the user';
				this.userLoading = false;
			}
		);
	}

	/**
	 * Exchange url for the one that contains the autologin token
	 */
	personalize(url) {
		let api = this.API_URL + '/auth/autologin';
		let headers = new Headers({ 
			'Authorization': this.tokens.user_token 
		});

		let params: URLSearchParams = new URLSearchParams();
		params.set('uri', encodeURIComponent(url));

		let options = new RequestOptions({ 
			headers: headers,
			search: params
		});
		return this.http.get(api, options);
	}

	validateEmail(email) {
		let filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
		if (filter.test(email)) {
		  return true;
		}
		return false;
	}

	validateMd5(md5) {
		return (/[a-fA-F0-9]{32}/).test(md5);
	}
}


export class User {
    constructor(
        public username: string) {
    }
}
