app.controller('CtrlFilter', ['$scope','ajax','$rootScope', function(scope,ajax,root){

	scope.vendedores = "";
	scope.clientes = "";
	scope.filter_date = "";
	scope.selVendedores = [];
	scope.selClientes = [];
	scope.selFilterDate = [];
	scope.resultados = [];
	scope.categorias_premios = [];
	scope.facturacion_total = 0;
	scope.facturacion_prod_clave = 0;
	scope.isAdmin = false;
	scope.canEdit = false;
	scope.inEdit = false;
	scope.inEditItemData = [];
	scope.chart = [];
	scope.id_current_edit = 0;
	scope.avance_producto = 0;
	scope.accede_categoria = 0;
	scope.start_app = false;
	/**
	 * Scope meses
	 */
	
	scope.monthOriginal = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
	scope.monthPeriod = ["agosto", "septiembre", "octubre", "noviembre", "diciembre","enero", "febrero", "marzo"];

	scope.meses ={

		agosto     : {
			total : 0,
			total_prod_clave : 0,
			disabled: true,
		},
	
		septiembre : {
			total : 0,
			total_prod_clave : 0,
			disabled: true,
		},
	
		octubre    : {
			total : 0,
			total_prod_clave : 0,
			disabled: true,
		},
	
		noviembre  : {
			total : 0,
			total_prod_clave : 0,
			disabled: true,
		},
	
		diciembre  : {
			total : 0,
			total_prod_clave : 0,
			disabled: true,
		},
	
		enero      : {
			total : 0,
			total_prod_clave : 0,
			disabled: true,
		},
	
		febrero    : {
			total : 0,
			total_prod_clave : 0,
			disabled: true,
		},
	
		marzo      : {
			total : 0,
			total_prod_clave : 0,
			disabled: true,
		}
	}






	var user = root.user;
	// ajax.user();
	
	if (user.role != 3) {
		scope.isAdmin = true;
	};	

	if (user.role != 3) {
		ajax.ve({method: 'vendedores', user: user},function(a){
			scope.selVendedores = a;
			// console.info('Reporting vendedores:', a);
		});
	};

	ajax.ve({method: 'periodos'},function(a){
		scope.selFilterDate = a;
	});

	ajax.ve({method: 'clientes', user: user},function(a){
		// console.info('Reporting setClientes:', a);

		scope.selClientes = a;
	});

	ajax.ve({method: 'catPremios'},function(a){
		scope.categorias_premios = a;
	});

	scope.setClientes = function(){
		ajax.ve({method: 'clientes', id: scope.vendedores, user: user},function(a){
			scope.selClientes = a;
		});
	}

	scope.submitFilter = function(){


		if (scope.filter_date == "") {
			alert('Por favor ingrese un periodo primero');
			return "";
		};
		var submit = {
			cliente: scope.clientes,
			date: scope.filter_date
		};
		if (user.role != 3) {
			submit.vendedor = scope.vendedores;
		};

		scope.inEdit = false;

		ajax.ve({method: 'filter', params: submit, user: user},function(a){
			// console.info('Reporting FILTRO:', a);
			scope.resultados = a;

		});
		
		// ajax.ve({method: 'totalByPeriod', date: scope.filter_date},function(a){
		// 	scope.facturacion_total = Math.round(a.total);
		// 	scope.facturacion_prod_clave = Math.round(a.producto_clave);
		// });

		ajax.ve({method : 'checkPeriod' , date: scope.filter_date}, function(a){
			var result = Boolean(parseInt(a));
			scope.canEdit = result;
		});

		scope.start_app = true;
	}


	scope.percentage = function(a,b){
		if (b == 0) {
			return 0;
		}else{
			var result = Math.round((parseFloat(b)/parseFloat(a))*100);
			return result;
		}
	}

	scope.avancetotal = function(curr_total,old_total){
		
		// console.info('Reporting curr_total:', curr_total);
		// console.info('Reporting old_total:', old_total);

		// return 0;
		if (curr_total != 0 && old_total != 0) {
			return Math.round( ( parseFloat(curr_total) / parseFloat(old_total) ) * 100 );
		}else{
			return 0;
		}
	}

	scope.oldPeriod = function(a){

		// console.info('Reporting check period:', a != undefined);
		if (a != undefined) {
			return true;
		}else{
			return false;
		}
		return false;
	}

	scope.prodClave = function(curr_total, curr_prod_clave){
		if (curr_total != 0 && curr_prod_clave != 0) {
			return Math.round( (parseFloat(curr_prod_clave) / parseFloat(curr_total)) * 100 );
		}else{
			return 0;
		}
	}

	scope.categoria = function(curr_prod_clave,curr_total,old_total){
		var total = 0;
		var prod_clave = 0;

		/**
		 * Formula
		 *
		 * Porcentaje de prod clave
		 * curr_total / curr_prod_clave * 100
		 *
		 * Porcentaje Avance total
		 * curr_total / old_total * 100
		 */
		var prod_clave = 0;
		if (curr_total != 0 && curr_prod_clave != 0) {
			prod_clave = Math.round( (parseFloat(curr_prod_clave) / parseFloat(curr_total)) * 100 );;
		};

		var avance_total = 0;
		if (curr_total != 0 && curr_prod_clave != 0) {
			avance_total = Math.round( (parseFloat(curr_total) / parseFloat(old_total)) * 100 );
		};

		
		if (prod_clave == 0 && avance_total == 0) {
			return 0;
		}else{
			if (avance_total >= 100) {

				var cat = 0;
				scope.categorias_premios.map(function(elem, index) {
					if (elem.max_req == 0) {elem.max_req = 999999999999};
					if (prod_clave >= elem.min_req && prod_clave <= elem.max_req) {
						cat = elem.categoria;
					};
				});

				return cat;
			}else{
				return 0;
			}
		}


		// console.info('Reporting :', a);
	}

	scope.editItem = function(val){

		
		scope.inEdit = true;
		// console.info('REPORTING COLLECTION:', val);
		scope.id_current_edit = val.id;
		var json_data = JSON.parse(val.facturacion);

		scope.setDataMonth(json_data);

		scope.graph(scope.graphObject());




		// console.info('Reporting :', val);
		// scope.avance_producto = scope.avancetotal(val.total,val.ultimo_total);
		// scope.accede_categoria = scope.categoria(val.total_prod_clave, val.total , val.ultimo_total);

	}

	scope.setDataMonth = function(data){
		var date = new Date();
		var month = date.getMonth();
		/**
		 * Mes actual
		 */
		var curr_month_original = scope.monthOriginal[month];

		/**
		 * Index de los meses del periodo
		 */
		var index_curr_period = scope.monthPeriod.indexOf(curr_month_original);


		$.each(scope.meses, function(index, val) {
			var each_index_month = scope.monthPeriod.indexOf(index);
			if (each_index_month <=  index_curr_period || each_index_month <=  (index_curr_period + 1) ) {
				scope.meses[index].disabled = false;
				scope.meses[index].total = data[scope.firstLetterUpper(index)].facturacion_total;
				scope.meses[index].total_prod_clave = data[scope.firstLetterUpper(index)].facturacion_prod_clave;
				
			};
		});
	}

	scope.firstLetterUpper = function(string){
		 return string.charAt(0).toUpperCase() + string.slice(1);
	}

	scope.ArraySelector = function(collection,index_sel){
		var date = new Date();
		var month = date.getMonth();
		/**
		 * Mes actual
		 */
		var curr_month_original = scope.monthOriginal[month];

		/**
		 * Index del mes actual en el periodo
		 */
		var index_curr_period = scope.monthPeriod.indexOf(curr_month_original);

		var format = [];
		var sum = 0;



		$.each(collection, function(index, val) {
			
			var mes = val.index;
			var month_each_index = scope.monthPeriod.indexOf(val.index);
			var value = val.obj[index_sel];
	
			// si es el primero
			if (month_each_index <= index_curr_period) {

				if (index > 0) {
						
					sum += value;
					format.push({value: sum, label: mes});
				
				}else{
					sum += value;
					format.push({value: value, label: mes});
				}
			}else{
				format.push({value: 0, label: mes});
			}
		});

		return format;
	}

	scope.graphObject = function(){

		var newMeses = [];
		$.each(scope.meses, function(index, val) {
			newMeses.push({obj: val, index: index});
		});

		var graphObject = {};
			graphObject.total = scope.ArraySelector(newMeses,'total');
			graphObject.prod_clave = scope.ArraySelector(newMeses,'total_prod_clave');
	
		return graphObject;
	}

	scope.updateFacturacion = function(){
		// console.info('Reporting :', scope.meses);
		// scope.updateGraph(scope.graphArray());
		ajax.ve({method: 'updateDataFacturacion', data: scope.meses ,id : scope.id_current_edit},function(a){

			/**
			 * Update datos de de la pantalla
			 */
			scope.avance_producto = scope.avancetotal(a.total,a.ultimo_total);
			scope.accede_categoria = scope.categoria(a.total_prod_clave, a.total , a.ultimo_total);

			scope.resultados.map(function(elem, index) {
				if (a.id == elem.id) {
					scope.resultados[index].total = a.total;
					scope.resultados[index].total_prod_clave = a.total_prod_clave;
					scope.resultados[index].ultimo_prod_clave = a.ultimo_prod_clave;
					scope.resultados[index].ultimo_prod_clave = a.ultimo_prod_clave;
					scope.resultados[index].ultimo_total = a.ultimo_total;
					scope.resultados[index].facturacion = a.facturacion;
				};
			})
			console.info('Reporting update:', a);	
			console.info('Reporting resultados:', scope.resultados);	
		});


	}


	scope.updateGraph = function(array){
		
		scope.graph(array);
	}
	scope.graph = function(object){

	console.info('Reporting object graph:', object);
	var chart = new CanvasJS.Chart("chartContainer",
		{

			title:{
				text: "Site Traffic",
				fontSize: 30
			},
                        animationEnabled: true,
			axisX:{

				gridColor: "Silver",
				tickColor: "silver",
				valueFormatString: "DD/MMM"

			},                        
                        toolTip:{
                          shared:true
                        },
			theme: "theme2",
			axisY: {
				gridColor: "Silver",
				tickColor: "silver"
			},
			legend:{
				verticalAlign: "center",
				horizontalAlign: "right"
			},
			data: [
			{        
				type: "line",
				showInLegend: true,
				lineThickness: 2,
				name: "Visits",
				markerType: "square",
				color: "#F08080",
				dataPoints: [
				{ x: new Date(2010,0,3), y: 650 },
				{ x: new Date(2010,0,5), y: 700 },
				{ x: new Date(2010,0,7), y: 710 },
				{ x: new Date(2010,0,9), y: 658 },
				{ x: new Date(2010,0,11), y: 734 },
				{ x: new Date(2010,0,13), y: 963 },
				{ x: new Date(2010,0,15), y: 847 },
				{ x: new Date(2010,0,17), y: 853 },
				{ x: new Date(2010,0,19), y: 869 },
				{ x: new Date(2010,0,21), y: 943 },
				{ x: new Date(2010,0,23), y: 970 }
				]
			},
			{        
				type: "line",
				showInLegend: true,
				name: "Unique Visits",
				color: "#20B2AA",
				lineThickness: 2,

				dataPoints: [
				{ x: new Date(2010,0,3), y: 510 },
				{ x: new Date(2010,0,5), y: 560 },
				{ x: new Date(2010,0,7), y: 540 },
				{ x: new Date(2010,0,9), y: 558 },
				{ x: new Date(2010,0,11), y: 544 },
				{ x: new Date(2010,0,13), y: 693 },
				{ x: new Date(2010,0,15), y: 657 },
				{ x: new Date(2010,0,17), y: 663 },
				{ x: new Date(2010,0,19), y: 639 },
				{ x: new Date(2010,0,21), y: 673 },
				{ x: new Date(2010,0,23), y: 660 }
				]
			}

			
			],
          legend:{
            cursor:"pointer",
            itemclick:function(e){
              if (typeof(e.dataSeries.visible) === "undefined" || e.dataSeries.visible) {
              	e.dataSeries.visible = false;
              }
              else{
                e.dataSeries.visible = true;
              }
              chart.render();
            }
          }
		});

chart.render();
	}

				








}])