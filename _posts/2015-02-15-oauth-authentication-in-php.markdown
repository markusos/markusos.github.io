---
layout: post
title:  "OAuth authentication in PHP"
date:   2015-02-17 17:00:00
categories: projects
tags:
    - Dev
    - PHP
    - Web
---

Setting up OAuth doesn't have to be a pain. There are tons of well-written and documented libraries for OAuth out there that are easy to use. If you want to authenticate against one of the larger sites on the web, like Facebook and Google, chances are that you don't have to do much more than installing the library and setting up some routs for the auth callback. In this post, I'm going to walk through a slightly more complex scenario, where we are gonna authenticate against [Basecamps](http://basecamp.com) API.


The first thing we need to do is to download the OAuth library that we want to use. In this post, I'm gonna use the [league/oauth2-client](https://github.com/thephpleague/oauth2-client) which is a well-tested PHP library for OAuth2 authentication. We do this by using composer.

{% highlight bash %}

$ composer require league/oauth2-client
$ composer update

{% endhighlight %}

Next, we need to create a custom OAuth provider for Basecamp, since it is not one of the already implemented OAuth providers in the library. We create a class called BasecampOAuth that extends the Abstract provider from the league/oauth2-client library. All information needed to set this up comes from [Basecamps API documentation](https://github.com/basecamp/api/blob/master/sections/authentication.md).

{% highlight php %}
<?php

use \League\OAuth2\Client\Provider\AbstractProvider;
use \League\OAuth2\Client\Token\AccessToken;

class BasecampOAuthProvider extends AbstractProvider {

    private $domain = 'https://launchpad.37signals.com/';

    public $responseType = 'json';

    public function getAuthorizationUrl($options = []) {

        $this->state = isset($options['state']) ?
             $options['state'] :
             md5(uniqid(rand(), true));

        $params = [
            'type' => 'web_server',
            'client_id' => $this->clientId,
            'redirect_uri' => $this->redirectUri,
            'state' => $this->state,
            'scope' => is_array($this->scopes) ?
                implode($this->scopeSeparator, $this->scopes) :
                $this->scopes,
            'response_type' => isset($options['response_type']) ?
                $options['response_type'] :
                'code',
            'approval_prompt' => isset($options['approval_prompt']) ?
                $options['approval_prompt'] :
                'auto',
        ];

        return $this->urlAuthorize() .
            '?' . $this->httpBuildQuery($params, '', '&');
    }

    public function urlAuthorize() {
        return $domain . 'authorization/new';
    }

    public function urlAccessToken() {
        return $domain . 'authorization/token?type=web_server';
    }

    public function urlUserDetails(AccessToken $token) {
        return $domain . 'authorization.json?access_token=' . $token;
    }

    public function userDetails($response, AccessToken $token) {
        $user = [
            'uid' => $response->identity->id,
            'firstName' => $response->identity->first_name,
            'lastName' => $response->identity->last_name,
            'email' => $response->identity->email_address
        ];

        return $user;
    }

    public function userUid($response, AccessToken $token) {
        return $response->identity->id;
    }

    public function userEmail($response, AccessToken $token) {
        return $response->identity->email_address;
    }

    public function userScreenName($response, AccessToken $token)
    {
        return $response->identity->email_address;
    }
}
{% endhighlight %}

Now we need to set up the routes to handle the OAuth requests and response.

Using Laravel the controller functions would look something like this:

{% highlight php %}
<?php

class AuthController extends BaseController {

    private $basecamp;

    public function __construct(BasecampOAuthProvider $basecamp) {
        $this->basecamp = $basecamp;
    }

    protected function oauth_register()
    {
        $authUrl = $this->basecamp->getAuthorizationUrl();
        Session::put('state', $this->basecamp->state);

        return Redirect::to($authUrl);
    }

    protected function oauth_callback()
    {
        $state = Input::get('state');

        if (empty($state) || $state !== Session::get('state')) {
            Session::forget('state');
            exit('Invalid state');
        }
        else {
            $token = $this->basecamp
                ->getAccessToken('authorization_code', [
                    'code' => Input::get('code')
            ]);

            Session::put('accessToken', $token->accessToken);
            $user = $this->basecamp->getUserDetails($token);
            Session::put('user', $user);

            return Redirect::to('/');
        }
    }
}

{% endhighlight %}

... and the routes for the OAuth registration and callback would look something like this:

{% highlight php %}
<?php

Route::get('/oauth/register', 'AuthController@oauth_register');
Route::get('/oauth/callback', 'AuthController@oauth_callback');

{% endhighlight %}

We initialize the BasecampOAuth class using the Laravel IoC container for dependency injection. Add this code with your other IoC initialization code, or in bootstrap/start.php.

{% highlight php %}
<?php

App::bind('BasecampOAuthProvider', function($app) {

    $provider = new BasecampOAuthProvider([
        'clientId'      => 'YOUR_CLIENT_ID_HERE',
        'clientSecret'  => 'YOUR_CLIENT_SECRET_HERE',
        'redirectUri'   => URL::to('oauth/callback'),
        'scopes'        => ['email', 'firstName', 'lastName'],
    ]);

    return $provider;
});

{% endhighlight %}

Now we just need to get the access token from the current session with ``Session::get('accessToken')`` and append it to the API calls.

To get the client Id and secret and start building your own app you need to register [here!](https://integrate.37signals.com/)

If you want to do OAuth authentification using services from Google, Facebook, or some of the other providers already included in the league/oauth2-client library, you can just skip the first step and use the library provider when implementing the controller code.
