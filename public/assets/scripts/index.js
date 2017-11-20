$(function()
{
    $('[data-toggle="popover"]').popover({
        placement : 'left',
        trigger : 'hover'
    });
});
$('#scrape').on("click", function(event)
{
	$('#scraped').fadeIn()
	$.ajax(
	{
		url: '/scrape',
		type: 'GET'
	}).then(function(result)
	{
		var newArticles = 0;
		var foundArticles = result.newPotentialArticles
		console.log("Found Articles: "+foundArticles)

		if (result.error === 0)
		{
			newArticles = foundArticles;
		}

		else
		{
			console.log(result)
			var errors = result.error.writeErrors.length
			var newArticles = foundArticles - errors;
		}

		$(".found-container").html('<p class="found">'+newArticles+' new article(s) found!</p>')

		setTimeout(function()
		{
			$('#scraped').fadeOut()

			setTimeout(function()
			{
				window.location.reload()
			}, 500)
		}, 500)
	})
})

$(".add").on("click", function(event)
{
	var id = $(this).attr("id")
	var message = $(this).parent().parent().find("#comment").val()

	var data = 
	{
		id: id,
		message: message
	}

	$.ajax(
	{
		url: "/addcomment",
		type: "POST",
		data: data
	}).then(function(result)
	{

		window.location.reload()
	})
})

$(".delete").on("click", function(event)
{
	var id = $(this).attr("id")

	$.ajax(
	{
		url: "/deletecomment/"+id,
		type: "DELETE",
	}).then(function(result)
	{
		window.location.reload()
	})
})