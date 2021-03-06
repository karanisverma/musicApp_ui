(function() {
    var app = angular.module('music-app', ['ngMaterial', 'ngResource', 'ngRoute']);
    // directive for star rating effect
    app.directive('starRating', starRating);

    function starRating() {
        return {
            restrict: 'EA',
            template: '<ul class="star-rating" ng-class="{readonly: readonly}">' +
                '  <li ng-repeat="star in stars" class="star" ng-class="{filled: star.filled}" ng-click="toggle($index)">' +
                '    <i class="fa fa-star"></i>' + // or &#9733
                '  </li>' +
                '</ul>',
            scope: {
                ratingValue: '=ngModel',
                max: '=?', // optional (default is 5)
                onRatingSelect: '&?',
                readonly: '=?'
            },
            link: function(scope, element, attributes) {
                if (scope.max == undefined) {
                    scope.max = 5;
                }

                function updateStars() {
                    scope.stars = [];
                    for (var i = 0; i < scope.max; i++) {
                        scope.stars.push({
                            filled: i < scope.ratingValue
                        });
                    }
                };
                scope.toggle = function(index) {
                    if (scope.readonly == undefined || scope.readonly === false) {
                        scope.ratingValue = index + 1;
                        scope.onRatingSelect({
                            rating: index + 1
                        });
                    }
                };
                scope.$watch('ratingValue', function(oldValue, newValue) {
                    if (newValue) {
                        updateStars();
                    }
                });
            }
        };
    }


    app.service('musicAppService', ['$resource', function($resource) {
        this.getResource = function(url) {
            return $resource(url);
        }
        this.buttonStatus = function(link_type) {
            if (link_type == null) {
                return false;
            } else {
                return true;
            }
        }
        this.init = function() {
            SC.initialize({
                client_id: '8fc961bc2dcf7c2247ea0357e1420a41'
            });
            var init_url = "http://104.197.128.152:8000/v1/tracks";
            trackResource = $resource(init_url);
            var val = trackResource.get(function() {
                console.log("init successful!", val);
            });
            return val;
        }
        this.init_val = this.init();

        this.initGenre = function() {
            var initGenre_url = "http://104.197.128.152:8000/v1/genres";
            genreResource = $resource(initGenre_url);
            var genVal = genreResource.get(function() {
                console.log("initGenre successful! ", genVal);
            });
            return genVal;
        }
        this.initGen_val = this.initGenre();

        this.getTrackProperty = function() {
            console.log("Getting Track property", this.trackProperty);
            return this.trackProperty;
        }
        this.setTrackProperty = function(property, results = 0, index = 0) {
            console.log("Setting Track property", property);
            this.trackProperty = property;
            this.trackProperty.results = results;
            this.trackProperty.index = index;
        }

        this.getGenreProperty = function() {
            console.log("Getting Genre property", this.GenreProperty);
            return this.genreProperty;
        }
        this.setGenreProperty = function(property, results, index) {
            console.log("Setting Genre property", property);
            this.genreProperty = property;
            this.genreProperty.results = results;
            this.genreProperty.index = index;
        }
        this.scSearch = function(search_song) {
            x = this;
            SC.initialize({
                client_id: '8fc961bc2dcf7c2247ea0357e1420a41'
            });
        }

    }]);

    app.controller('genreController', ['$scope', '$resource', '$mdDialog',
        '$mdMedia', 'musicAppService',
        function($scope, $resource, $mdDialog, $mdMedia, musicAppService) {
            var genre = this;
            genre.showEditGenre = false;
            genre.showNewTrack = false;
            genre.showNext = false;
            genre.showPrev = false;
            var initGen_val = musicAppService.initGen_val;
            initGen_val.$promise.then(function(data) {
                genre.genreList = initGen_val.results;
                genre.next = initGen_val.next;
                genre.prev = initGen_val.previous;
                genre.showNext = musicAppService.buttonStatus(genre.next);
                genre.showPrev = musicAppService.buttonStatus(genre.prev);
            });
            this.nextGen = function() {
                console.log('next gen is clicked');
                var url = genre.next;
                trackFactory = $resource(url);
                var val = trackFactory.get(
                    function() {
                        console.log("Val value is => ", val.results);
                        genre.genreList = val.results;
                        genre.next = val.next;
                        genre.prev = val.previous;
                        genre.showNext = musicAppService.buttonStatus(genre.next);
                        genre.showPrev = musicAppService.buttonStatus(genre.prev);
                    });
            }
            this.prevGen = function() {
                var url = genre.prev;
                trackFactory = $resource(url);
                var val = trackFactory.get(
                    function() {
                        console.log("Val value is => ", val.results);
                        genre.genreList = val.results;
                        genre.next = val.next;
                        genre.prev = val.previous;
                        genre.showNext = musicAppService.buttonStatus(genre.next);
                        genre.showPrev = musicAppService.buttonStatus(genre.prev);
                    });
            }


            this.showNewGenreForm = function(ev) {
                console.log("Showing New genre form");
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && this.customFullscreen;
                $mdDialog.show({
                    controller: newGenreController,
                    templateUrl: 'template/newGenre.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen
                }).then(function(answer) {
                    console.log("ok is pressed");
                }, function() {
                    var refreshGen = musicAppService.initGenre();
                    refreshGen.$promise.then(function(data) {
                        genre.genreList = refreshGen.results;
                        genre.next = refreshGen.next;
                        genre.prev = refreshGen.previous;
                        genre.showNext = musicAppService.buttonStatus(genre.next);
                        genre.showPrev = musicAppService.buttonStatus(genre.prev);
                    });

                });

                $scope.$watch(function() {
                    return $mdMedia('xs') || $mdMedia('sm');
                }, function(wantsFullScreen) {
                    this.customFullscreen = (wantsFullScreen === true);
                });
            };


            this.showEditGenreForm = function(genProp, index, ev) {
                musicAppService.setGenreProperty(genProp, genre.genreList, index);
                console.log("under show  Edit form function");
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && this.customFullscreen;
                $mdDialog.show({
                    controller: editGenreController,
                    templateUrl: 'template/editGenre.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen
                }).then(function(newResults) {
                    genre.genreList = newResults;
                    console.log("Done! Done! Done!");
                }, function() {
                    var refreshGen = musicAppService.initGenre();
                    refreshGen.$promise.then(function(data) {
                        genre.genreList = refreshGen.results;
                        genre.next = refreshGen.next;
                        genre.prev = refreshGen.previous;
                    });

                });

                $scope.$watch(function() {
                    return $mdMedia('xs') || $mdMedia('sm');
                }, function(wantsFullScreen) {
                    this.customFullscreen = (wantsFullScreen === true);
                });
            };
        }
    ]);

    app.controller('trackController', ['$scope', '$resource', '$mdDialog',
        '$mdMedia', 'musicAppService',
        function($scope, $resource, $mdDialog, $mdMedia, musicAppService) {
            var track = this;
            track.showNext = false;
            track.showPrev = false;
            track.showNav = true;
            track.showClose = false;
            track.rating1 = 2;
            var init_val = musicAppService.init_val;
            init_val.$promise.then(function(data) {
                track.trackList = init_val.results;
                track.next = init_val.next;
                track.prev = init_val.previous;
                track.showNext = musicAppService.buttonStatus(track.next);
                track.showPrev = musicAppService.buttonStatus(track.prev);
            });

            this.play = function(trackProp, ev) {
                musicAppService.setTrackProperty(trackProp);
                console.log("yayayayayayay!!!");
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && this.customFullscreen;
                $mdDialog.show({
                    controller: playTrackController,
                    templateUrl: 'template/playTrack.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen
                }).then(function(newResults) {
                    console.log("ook is pressed", newResults);
                    track.trackList = newResults;


                }, function() {
                    console.log("cancel is pressed");


                });

                $scope.$watch(function() {
                    return $mdMedia('xs') || $mdMedia('sm');
                }, function(wantsFullScreen) {
                    this.customFullscreen = (wantsFullScreen === true);
                });
            }

            this.refresh = function() {
                track.showClose = false;
                track.showNav = true;
                var init_val = musicAppService.init_val;
                init_val.$promise.then(function(data) {
                    track.trackList = init_val.results;
                    track.next = init_val.next;
                    track.prev = init_val.previous;
                    track.showNext = musicAppService.buttonStatus(track.next);
                    track.showPrev = musicAppService.buttonStatus(track.prev);
                });

            }
            this.showEditTrackForm = function(trackProp, index, ev) {
                musicAppService.setTrackProperty(trackProp, track.trackList, index);
                console.log("under show  Edit form function");
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && this.customFullscreen;
                $mdDialog.show({
                    controller: editTrackController,
                    templateUrl: 'template/editTrack.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen
                }).then(function(newResults) {
                    console.log("ook is pressed", newResults);
                    track.trackList = newResults;


                }, function() {
                    console.log("cancel is pressed");


                });

                $scope.$watch(function() {
                    return $mdMedia('xs') || $mdMedia('sm');
                }, function(wantsFullScreen) {
                    this.customFullscreen = (wantsFullScreen === true);
                });
            };


            this.showNewTrackForm = function(ev) {
                console.log("under show form function");
                var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && this.customFullscreen;
                $mdDialog.show({
                    controller: newTrackController,
                    templateUrl: 'template/newtrack.tmpl.html',
                    parent: angular.element(document.body),
                    targetEvent: ev,
                    clickOutsideToClose: true,
                    fullscreen: useFullScreen
                }).then(function(answer) {
                    console.log("ok is pressed");
                }, function() {
                    console.log("cancel is pressed");
                });

                $scope.$watch(function() {
                    return $mdMedia('xs') || $mdMedia('sm');
                }, function(wantsFullScreen) {
                    this.customFullscreen = (wantsFullScreen === true);
                });
            };


            this.search = function() {
                if (track.searchKeyword) {
                    var url = 'http://104.197.128.152:8000/v1/tracks';
                    track.showNav = false;
                    track.showClose = true;

                    
                    trackFactory = $resource(url);
                    var entry = trackFactory.get({ title: track.searchKeyword }, function() {
                        console.log(entry);
                        track.trackList = entry.results;
                    });
                }
            }
            this.nextTrack = function() {
                var url = track.next;
                trackFactory = $resource(url);
                var val = trackFactory.get(
                    function() {
                        console.log("Val value is => ", val.results);
                        track.trackList = val.results;
                        track.next = val.next;
                        track.prev = val.previous;
                        track.showNext = musicAppService.buttonStatus(track.next);
                        track.showPrev = musicAppService.buttonStatus(track.prev);
                    });
            }
            this.prevTrack = function() {
                var url = track.prev;
                trackFactory = $resource(url);
                var val = trackFactory.get(
                    function() {
                        console.log("Val value is => ", val.results);
                        track.trackList = val.results;
                        track.next = val.next;
                        track.prev = val.previous;
                        track.showNext = musicAppService.buttonStatus(track.next);
                        track.showPrev = musicAppService.buttonStatus(track.prev);
                    });
            }
        }
    ]); //closing controller
    function newGenreController($resource, $scope, $mdDialog) {
        $scope.newGenre = function() {
            newGen_url = "http://104.197.128.152:8000/v1/genres";
            newGenResource = $resource(newGen_url);
            newGenData = { name: $scope.name };
            newGenResource.save(newGenData, function() {
                console.log("you nailed it man!");
            });
            $mdDialog.hide();
        }
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.answer = function(answer) {
            console.log("calling cancel function");
            $mdDialog.hide(answer);
        };

    } //closing controller

    function editGenreController($resource, $scope, $mdDialog, musicAppService) {
        genreVal = musicAppService.getGenreProperty();
        console.log("getting in genreVal", genreVal);
        $scope.name = genreVal.name;
        $scope.id = genreVal.id;
        $scope.update = function() {
            if ($scope.name) {
                editGenUrl = "http://104.197.128.152:8000/v1/genres/" + $scope.id;
                resourceGen = $resource(editGenUrl);
                editGenData = { id: $scope.id, name: $scope.name };
                console.log("sending data is ", editGenData);
                resourceGen.save(editGenData, function() {
                    console.log("changes have been made for genre you are awesome");
                    angular.copy(editGenData, genreVal.results[genreVal.index]);
                });
                $mdDialog.hide(genreVal.results);
            }
        }
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.answer = function(answer) {
            console.log("calling cancel function");
            $mdDialog.hide(answer);
        };
    } //closing controller

    function editTrackController($resource, $scope, $mdDialog, musicAppService) {
        val = musicAppService.getTrackProperty();
        $scope.id = val.id;
        $scope.trackname = val.title;
        $scope.rating = parseInt(val.rating, 10);
        $scope.initGen = [];
        console.log(">>>>>>>>>> ", val.results);
        console.log(">>>>>>>>>> ", val.index);

        $scope.getGenId = function(genres) {
            console.log(genres);
            angular.forEach(genres, function(val) {
                console.log("under for each", val);
                $scope.initGen.push(val.id);
            });
            console.log($scope.initGen);
            return $scope.initGen;
        }
        $scope.genres = $scope.getGenId(val.genres);
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.loadGenres = function() {
            console.log("button is clicked!");
            var url = 'http://104.197.128.152:8000/v1/genres';
            loadGenRes = $resource(url);
            var val = loadGenRes.get(function() {
                console.log(val.results);
                $scope.allGenres = val.results;
                $scope.genresNext = val.next;
            });
        }
        $scope.loadMoreGenre = function(old_gen) {
            console.log("load more button is clicked!");
            var url = $scope.genresNext;
            console.log("next genres url => " + $scope.genresNext);
            loadMoreGenRes = $resource(url);
            var val = loadMoreGenRes.get(function() {
                console.log("load more is successful!");
                $scope.allGenres = old_gen;
                console.log(val);
                $scope.allGenres.push.apply($scope.allGenres, val.results);
                $scope.genresNext = val.next;
            });

        }
        $scope.appandGenre = function(id) {
            if (jQuery.inArray(id, $scope.genres) == -1) {
                $scope.genres.push(id);
            } else {
                $scope.genres = jQuery.grep($scope.genres, function(value) {
                    return value != id;
                });
            }
            console.log($scope.genres);
        }

        $scope.saveTrack = function() {
            console.log("XXXXXXXXX->", val.results);
            if ($scope.trackname) {
                var url = 'http://104.197.128.152:8000/v1/tracks/' + $scope.id;
                editTraRes = $resource(url);
                data = { id: $scope.id, title: $scope.trackname, rating: $scope.rating, genres: val.genres }
                editTrack = JSON.stringify({ id: $scope.id, title: $scope.trackname, rating: $scope.rating, genres: $scope.genres });
                console.log("Ready Edit data => ", editTrack);
                editTraRes.save(editTrack, function() {
                    console.log("done like a boss !!");
                    angular.copy(data, val.results[val.index]);
                });
                $mdDialog.hide(val.results);
            }
        }

    };

    function playTrackController($resource, $scope, $mdDialog, musicAppService) {
        val = musicAppService.getTrackProperty();
        var currentPlayer;
        $scope.showError = false;
        $scope.showPlay = false;
        $scope.showPause = true;
        $scope.showLoader = true;
        console.log("From play option", val.title);
        $scope.trackname = val.title;
        SC.get('/tracks', {
            q: $scope.trackname,
            license: 'cc-by-sa'
        }).then(function(tracks) {
            console.log("Tracks are => " + tracks);
            if (tracks.length > 0 && typeof tracks != 'undefined') {
                console.log("STREAMING URL is => ", tracks[0].stream_url);
                $scope.showLoader = false;
                console.log("show loader is =>", $scope.showLoader);
                $scope.streamTrack(tracks[0]);
            } else {
                console.log("NOTHING FOUND!!");
                $scope.showError = true;
            }
        });
        $scope.cancel = function() {
            $mdDialog.cancel();
            if (currentPlayer) {
                currentPlayer.pause();
            }
        };
        $scope.streamTrack = function(track) {
            
            return SC.stream('/tracks/' + track.id).then(function(player) {
                currentPlayer = player;
                player.play();

            }).catch(function() {
                console.log(arguments);
            });
        };
        $scope.play = function() {
            if (currentPlayer) {
                currentPlayer.play();
                $scope.showPlay = false;
                $scope.showPause = true;
            }
        }
        $scope.pause = function() {
                if (currentPlayer) {
                    currentPlayer.pause();
                    $scope.showPlay = true;
                    $scope.showPause = false;
                }
            }

        console.log("Search Results =>", musicAppService.searchResult);

    }

    function newTrackController($resource, $scope, $mdDialog) {
        $scope.genresArray = [];
        $scope.hide = function() {
            $mdDialog.hide();
        };
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.loadGenres = function() {
            console.log("button is clicked!");
            var url = 'http://104.197.128.152:8000/v1/genres';
            loadGenRes = $resource(url);
            var val = loadGenRes.get(function() {
                console.log(val.results);
                $scope.allGenres = val.results;
                $scope.genresNext = val.next;
            });
        }
        $scope.loadMoreGenre = function(old_gen) {
            console.log("load more button is clicked!");
            var url = $scope.genresNext;
            console.log("next genres url => " + $scope.genresNext);
            loadMoreGenRes = $resource(url);
            var val = loadMoreGenRes.get(function() {
                console.log("load more is successful!");
                $scope.allGenres = old_gen;
                console.log(val);
                $scope.allGenres.push.apply($scope.allGenres, val.results);
                $scope.genresNext = val.next;
            });
        }
        $scope.appandGenre = function(id) {
            if (jQuery.inArray(id, $scope.genresArray) == -1) {
                $scope.genresArray.push(id);
            } else {
                $scope.genresArray = jQuery.grep($scope.genresArray, function(value) {
                    return value != id;
                });
            }
            console.log($scope.genresArray);
        }

        $scope.saveTrack = function() {
            if ($scope.trackname) {
                var url = 'http://104.197.128.152:8000/v1/tracks';
                saveTraRes = $resource(url);
                newTrack = JSON.stringify({ title: $scope.trackname, rating: $scope.rating, genres: $scope.genresArray });
                console.log("Ready save data => ", newTrack);
                saveTraRes.save(newTrack, function() {
                    console.log("done like a boss !!");
                });
                $mdDialog.hide();
            }
        }
    } //closing controller



    app.config(function($mdThemingProvider) {
        $mdThemingProvider.theme('dark-grey').backgroundPalette('grey').dark();
        $mdThemingProvider.theme('dark-orange').backgroundPalette('orange').dark();
        $mdThemingProvider.theme('dark-purple').backgroundPalette('deep-purple').dark();
        $mdThemingProvider.theme('dark-blue').backgroundPalette('blue').dark();
    });
})();
